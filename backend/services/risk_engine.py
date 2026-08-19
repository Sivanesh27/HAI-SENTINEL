import json
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

from ml.inference.engine import get_inference_engine
from ml.features.temporal_extractor import _compute_slope


class DynamicRiskTrajectoryEngine:
    """
    Continuous temporal risk tracking engine for hospitalized ICU patients.
    Maintains sequential risk estimates, calculus derivatives (velocity, acceleration),
    rapid escalation alerts, and prioritization tiers.
    """
    def __init__(self):
        self.inference_engine = get_inference_engine()

    def process_patient_trajectory(
        self,
        patient_meta: Dict[str, Any],
        vitals_timeseries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Ingests sequential hourly observations for a patient and computes dynamic risk trajectory.
        
        Args:
            patient_meta: dict with age, gender, charlson_comorbidity_index, recent_surgery
            vitals_timeseries: list of chronological observation dicts
            
        Returns:
            Structured risk trajectory payload conforming to GET /api/patients/{id}/risk
        """
        if not vitals_timeseries:
            raise ValueError("Vitals time series cannot be empty.")

        # Sort chronologically by hour_from_admission
        records = sorted(vitals_timeseries, key=lambda x: x["hour_from_admission"])
        trajectory_points = []

        gender_male = 1 if str(patient_meta.get("gender", "")).upper().startswith("M") else 0
        age = float(patient_meta.get("age", 60.0))
        charlson = int(patient_meta.get("charlson_comorbidity_index", 0))
        recent_surg = 1 if patient_meta.get("recent_surgery") else 0

        # Step 1: Compute calibrated risk point-by-point for every observation hour
        for i, rec in enumerate(records):
            h = rec["hour_from_admission"]

            # Backward window up to index i
            w12 = records[max(0, i - 12) : i + 1]
            w24 = records[max(0, i - 24) : i + 1]

            hr_series = np.array([r["heart_rate"] for r in w12])
            temp_series = np.array([r["temp_c"] for r in w12])
            map_series = np.array([r["map"] for r in w12])
            wbc_series = np.array([r["wbc"] for r in w24])
            plt_series = np.array([r["platelets"] for r in w24])

            # Extract instantaneous & rolling features
            feature_dict = {
                "age": age,
                "gender_male": gender_male,
                "charlson_comorbidity_index": charlson,
                "recent_surgery": recent_surg,
                "hour_from_admission": float(h),
                
                "heart_rate_last": float(rec["heart_rate"]),
                "heart_rate_mean_12h": float(np.mean(hr_series)),
                "heart_rate_slope_12h": float(_compute_slope_array(hr_series)),
                
                "temp_c_last": float(rec["temp_c"]),
                "temp_c_max_12h": float(np.max(temp_series)),
                "temp_c_slope_12h": float(_compute_slope_array(temp_series)),
                
                "resp_rate_mean_12h": float(np.mean([r["resp_rate"] for r in w12])),
                "spo2_min_12h": float(np.min([r["spo2"] for r in w12])),
                "map_mean_12h": float(np.mean(map_series)),
                "map_min_12h": float(np.min(map_series)),
                
                "wbc_last": float(rec["wbc"]),
                "wbc_change_24h": float(rec["wbc"] - w24[0]["wbc"]),
                "wbc_slope_24h": float(_compute_slope_array(wbc_series)),
                
                "platelets_last": float(rec["platelets"]),
                "platelets_slope_24h": float(_compute_slope_array(plt_series)),
                
                "creatinine_last": float(rec["creatinine"]),
                "lactate_last": float(rec["lactate"]),
                
                "cvc_duration_hours": float(rec.get("cvc_duration_hours", 0.0)),
                "foley_duration_hours": float(rec.get("foley_duration_hours", 0.0)),
                "vent_duration_hours": float(rec.get("vent_duration_hours", 0.0)),
                "total_device_burden": int(rec.get("total_device_burden", 0)),
                "broad_spec_antibiotics_72h": int(rec.get("broad_spec_antibiotics_72h", 0))
            }

            # Only compute full SHAP for the latest timestamp to optimize latency
            is_latest = (i == len(records) - 1)
            pred = self.inference_engine.predict_patient_state(feature_dict, include_shap=is_latest)

            trajectory_points.append({
                "hour_from_admission": h,
                "timestamp": rec["timestamp"],
                "calibrated_risk_pct": pred["calibrated_risk_pct"],
                "risk_category": pred["risk_category"],
                "data_completeness_pct": pred["data_completeness_pct"],
                "confidence_level": pred["confidence_level"],
                "feature_snapshot": feature_dict,
                "explanation": pred.get("explanation") if is_latest else None
            })

        # Step 2: Temporal Calculus (Deltas, Velocity, Acceleration) on trajectory
        n_points = len(trajectory_points)
        latest = trajectory_points[-1]
        latest_risk = latest["calibrated_risk_pct"]

        # Helper to find risk at t - k hours
        def get_risk_at_lag(lag_hours: int) -> float:
            target_hour = latest["hour_from_admission"] - lag_hours
            candidates = [p for p in trajectory_points if p["hour_from_admission"] <= target_hour]
            return candidates[-1]["calibrated_risk_pct"] if candidates else trajectory_points[0]["calibrated_risk_pct"]

        risk_t_minus_6 = get_risk_at_lag(6)
        risk_t_minus_12 = get_risk_at_lag(12)
        risk_t_minus_24 = get_risk_at_lag(24)

        delta_6h = round(latest_risk - risk_t_minus_6, 1)
        delta_12h = round(latest_risk - risk_t_minus_12, 1)
        delta_24h = round(latest_risk - risk_t_minus_24, 1)

        # Risk Velocity (% points / hour over 12 hours)
        velocity_12h = round(delta_12h / 12.0, 2)

        # Risk Velocity at t - 12h for acceleration calculus
        # Find velocity at (t-12h)
        prev_12h_hour = latest["hour_from_admission"] - 12
        prev_points = [p for p in trajectory_points if p["hour_from_admission"] <= prev_12h_hour]
        if prev_points:
            prev_latest = prev_points[-1]
            prev_target = prev_latest["hour_from_admission"] - 12
            prev_lag = [p for p in trajectory_points if p["hour_from_admission"] <= prev_target]
            prev_risk_lag = prev_lag[-1]["calibrated_risk_pct"] if prev_lag else trajectory_points[0]["calibrated_risk_pct"]
            prev_velocity_12h = (prev_latest["calibrated_risk_pct"] - prev_risk_lag) / 12.0
            acceleration_12h = round((velocity_12h - prev_velocity_12h) / 12.0, 3)
        else:
            acceleration_12h = 0.0

        # Rapid Escalation Flag
        rapid_escalation = bool(delta_12h >= 15.0 or velocity_12h >= 1.25 or latest_risk >= 80.0)

        # Prioritization Tier (1 = Immediate, 2 = Elevated Watch, 3 = Standard)
        if latest_risk >= 80.0 or (latest_risk >= 60.0 and rapid_escalation):
            review_priority = 1
        elif latest_risk >= 50.0 or velocity_12h >= 0.5:
            review_priority = 2
        else:
            review_priority = 3

        # Formulate non-causal trajectory summary string
        first_point = trajectory_points[0]
        total_time_span = latest["hour_from_admission"] - first_point["hour_from_admission"]
        net_delta = round(latest_risk - first_point["calibrated_risk_pct"], 1)

        if net_delta > 0:
            trajectory_summary = (
                f"Predicted risk increased by {net_delta:+.1f} percentage points over the last {total_time_span} hours "
                f"({first_point['calibrated_risk_pct']:.1f}% → {latest_risk:.1f}%)."
            )
        elif net_delta < 0:
            trajectory_summary = (
                f"Predicted risk decreased by {abs(net_delta):.1f} percentage points over the last {total_time_span} hours "
                f"({first_point['calibrated_risk_pct']:.1f}% → {latest_risk:.1f}%)."
            )
        else:
            trajectory_summary = f"Predicted risk remained stable at {latest_risk:.1f}% over the last {total_time_span} hours."

        # Filtered trajectory array for web response (downsample if long)
        step = max(1, len(trajectory_points) // 24)
        formatted_trajectory = [
            {
                "hour_from_admission": p["hour_from_admission"],
                "timestamp": p["timestamp"],
                "risk_pct": p["calibrated_risk_pct"],
                "risk_category": p["risk_category"]
            }
            for p in trajectory_points[::step]
        ]
        # Ensure latest point is strictly present
        if formatted_trajectory[-1]["hour_from_admission"] != latest["hour_from_admission"]:
            formatted_trajectory.append({
                "hour_from_admission": latest["hour_from_admission"],
                "timestamp": latest["timestamp"],
                "risk_pct": latest["calibrated_risk_pct"],
                "risk_category": latest["risk_category"]
            })

        return {
            "patient_id": patient_meta.get("patient_id", "UNKNOWN"),
            "current_risk": latest_risk,
            "risk_category": latest["risk_category"],
            "confidence": latest["confidence_level"],
            "data_completeness_pct": latest["data_completeness_pct"],
            "risk_delta_6h": delta_6h,
            "risk_delta_12h": delta_12h,
            "risk_delta_24h": delta_24h,
            "risk_velocity": velocity_12h,
            "risk_velocity_label": f"{delta_12h:+.1f}% / 12h",
            "risk_acceleration": acceleration_12h,
            "rapid_escalation": rapid_escalation,
            "review_priority": review_priority,
            "trajectory_summary": trajectory_summary,
            "trajectory": formatted_trajectory,
            "timestamp": latest["timestamp"],
            "model_version": latest.get("model_version", "1.0.0"),
            "top_features": latest["explanation"] if latest["explanation"] else None,
            "scientific_disclaimer": (
                "HAI-Sentinel Dynamic Risk Trajectory: Identifies temporal risk changes for infection-prevention review. "
                "Does not assert causal etiology or clinical infection diagnosis."
            )
        }


def _compute_slope_array(arr: np.ndarray) -> float:
    n = len(arr)
    if n < 2:
        return 0.0
    x = np.arange(n)
    denom = np.sum((x - x.mean()) ** 2)
    if denom == 0:
        return 0.0
    return float(np.sum((x - x.mean()) * (arr - arr.mean())) / denom)


_TRAJECTORY_ENGINE_INSTANCE = None


def get_trajectory_engine() -> DynamicRiskTrajectoryEngine:
    global _TRAJECTORY_ENGINE_INSTANCE
    if _TRAJECTORY_ENGINE_INSTANCE is None:
        _TRAJECTORY_ENGINE_INSTANCE = DynamicRiskTrajectoryEngine()
    return _TRAJECTORY_ENGINE_INSTANCE
