import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime


class WardClusterDetector:
    """
    Spatial-temporal cluster detector for hospital wards.
    Aggregates patient-level risk trajectories within each clinical unit,
    evaluates risk density, and identifies concurrent rapid escalations.
    
    IMPORTANT SCIENTIFIC GUARDRAIL:
    All positive cluster signals are designated strictly as:
    "Potential cluster requiring IPC review."
    NEVER designated as a confirmed outbreak.
    """
    def __init__(
        self,
        high_risk_threshold: float = 60.0,
        min_cluster_patients: int = 3,
        density_alert_threshold: float = 0.35
    ):
        self.high_risk_threshold = high_risk_threshold
        self.min_cluster_patients = min_cluster_patients
        self.density_alert_threshold = density_alert_threshold

    def analyze_ward(
        self,
        ward_id: str,
        ward_name: str,
        unit_type: str,
        bed_count: int,
        patients: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes all active patients in a ward to compute risk aggregations,
        spatial risk density, and cluster anomaly signals.
        """
        total_patients = len(patients)
        if total_patients == 0:
            return {
                "ward_id": ward_id,
                "ward_name": ward_name,
                "unit_type": unit_type,
                "bed_count": bed_count,
                "occupied_beds": 0,
                "occupancy_rate_pct": 0.0,
                "average_risk": 0.0,
                "median_risk": 0.0,
                "risk_density": 0.0,
                "high_risk_count": 0,
                "critical_risk_count": 0,
                "rapidly_rising_count": 0,
                "ward_risk_level": "LOW",
                "cluster_signal": False,
                "cluster_message": "No active cluster signal.",
                "review_recommendation": "Routine IPC surveillance."
            }

        risk_scores = np.array([p["current_risk"] for p in patients])
        avg_risk = float(np.mean(risk_scores))
        median_risk = float(np.median(risk_scores))

        high_risk_pts = [p for p in patients if p["current_risk"] >= 60.0]
        critical_risk_pts = [p for p in patients if p["current_risk"] >= 80.0]
        rapidly_rising_pts = [p for p in patients if p.get("rapid_escalation", False)]

        high_risk_count = len(high_risk_pts)
        critical_risk_count = len(critical_risk_pts)
        rapidly_rising_count = len(rapidly_rising_pts)

        # Risk density = (Sum of risks) / (Bed Count * 100)
        risk_density = float(np.sum(risk_scores) / (bed_count * 100.0))
        occupancy_rate = float((total_patients / bed_count) * 100.0)

        # Determine Ward Overall Risk Level
        if critical_risk_count >= 2 or high_risk_count >= 4 or avg_risk >= 50.0:
            ward_level = "HIGH"
        elif high_risk_count >= 2 or avg_risk >= 35.0:
            ward_level = "MODERATE"
        else:
            ward_level = "LOW"

        # Cluster Detection Algorithm:
        # Triggered if >= 3 high-risk patients AND >= 2 rapidly rising patients in the same unit
        # OR risk density exceeds density_alert_threshold with concurrent escalations
        cluster_triggered = bool(
            (high_risk_count >= self.min_cluster_patients and rapidly_rising_count >= 2) or
            (risk_density >= self.density_alert_threshold and rapidly_rising_count >= 2)
        )

        if cluster_triggered:
            cluster_message = "Potential cluster requiring IPC review."
            recommendation = (
                f"Elevated spatial-temporal risk concentration detected in {ward_name}. "
                f"Initiate IPC environmental screening, audit central-line/foley bundle compliance, "
                f"and review co-located patients ({', '.join([p['patient_id'] for p in rapidly_rising_pts[:4]])})."
            )
        else:
            cluster_message = "No anomalous risk cluster detected."
            recommendation = "Standard unit-level infection prevention rounding."

        return {
            "ward_id": ward_id,
            "ward_name": ward_name,
            "unit_type": unit_type,
            "bed_count": bed_count,
            "occupied_beds": total_patients,
            "occupancy_rate_pct": round(occupancy_rate, 1),
            "average_risk": round(avg_risk, 1),
            "median_risk": round(median_risk, 1),
            "risk_density": round(risk_density, 3),
            "high_risk_count": high_risk_count,
            "critical_risk_count": critical_risk_count,
            "rapidly_rising_count": rapidly_rising_count,
            "ward_risk_level": ward_level,
            "cluster_signal": cluster_triggered,
            "cluster_message": cluster_message,
            "review_recommendation": recommendation,
            "contributing_patients": [
                {
                    "patient_id": p["patient_id"],
                    "bed": p["bed"],
                    "current_risk": p["current_risk"],
                    "risk_velocity_label": p.get("risk_velocity_label", ""),
                    "rapid_escalation": p.get("rapid_escalation", False),
                    "review_priority": p.get("review_priority", 3)
                }
                for p in patients if p["current_risk"] >= 50.0 or p.get("rapid_escalation", False)
            ],
            "scientific_disclaimer": (
                "Algorithmic spatial-temporal signal. Represents localized statistical risk density "
                "and does not constitute microbiological or epidemiological proof of an outbreak."
            )
        }


_DETECTOR_INSTANCE = None


def get_cluster_detector() -> WardClusterDetector:
    global _DETECTOR_INSTANCE
    if _DETECTOR_INSTANCE is None:
        _DETECTOR_INSTANCE = WardClusterDetector()
    return _DETECTOR_INSTANCE
