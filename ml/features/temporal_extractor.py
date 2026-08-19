import pandas as pd
import numpy as np
from typing import List, Tuple, Dict

FEATURE_NAMES = [
    # Demographics & Static
    "age",
    "gender_male",
    "charlson_comorbidity_index",
    "recent_surgery",
    "hour_from_admission",
    
    # Vital signs (instantaneous & temporal)
    "heart_rate_last",
    "heart_rate_mean_12h",
    "heart_rate_slope_12h",
    "temp_c_last",
    "temp_c_max_12h",
    "temp_c_slope_12h",
    "resp_rate_mean_12h",
    "spo2_min_12h",
    "map_mean_12h",
    "map_min_12h",
    
    # Laboratory trajectories
    "wbc_last",
    "wbc_change_24h",
    "wbc_slope_24h",
    "platelets_last",
    "platelets_slope_24h",
    "creatinine_last",
    "lactate_last",
    
    # Invasive device & medication exposures
    "cvc_duration_hours",
    "foley_duration_hours",
    "vent_duration_hours",
    "total_device_burden",
    "broad_spec_antibiotics_72h"
]


def _compute_slope(series: pd.Series) -> float:
    """Computes simple least-squares linear slope over an indexed window."""
    n = len(series)
    if n < 2:
        return 0.0
    x = np.arange(n)
    y = series.values
    x_mean = x.mean()
    y_mean = y.mean()
    denom = np.sum((x - x_mean) ** 2)
    if denom == 0:
        return 0.0
    slope = np.sum((x - x_mean) * (y - y_mean)) / denom
    return float(slope)


def extract_temporal_features(
    df_meta: pd.DataFrame,
    df_ts: pd.DataFrame,
    min_observation_hours: int = 12
) -> pd.DataFrame:
    """
    Extracts causal, backward-looking rolling features for every patient timestamp t.
    STRICTLY AVOIDS TEMPORAL LEAKAGE: No forward-looking windows or future data are used.
    
    Returns a tabular feature matrix ready for supervised training / evaluation.
    """
    # Merge static attributes
    meta_subset = df_meta[[
        "patient_id", "age", "gender", "charlson_comorbidity_index", "recent_surgery"
    ]].copy()
    meta_subset["gender_male"] = (meta_subset["gender"] == "M").astype(int)

    df_merged = pd.merge(df_ts, meta_subset, on="patient_id", how="left")
    df_merged = df_merged.sort_values(by=["patient_id", "hour_from_admission"]).reset_index(drop=True)

    feature_rows = []

    # Group strictly by patient
    for patient_id, group in df_merged.groupby("patient_id"):
        group = group.reset_index(drop=True)
        n_obs = len(group)

        for i in range(n_obs):
            h = group.loc[i, "hour_from_admission"]
            if h < min_observation_hours:
                continue  # Need at least min_observation_hours to establish baseline trajectory

            # Backward-looking slices strictly up to index i
            idx_12h_start = max(0, i - 12)
            idx_24h_start = max(0, i - 24)

            w12 = group.iloc[idx_12h_start : i + 1]
            w24 = group.iloc[idx_24h_start : i + 1]

            # Computations
            hr_last = float(group.loc[i, "heart_rate"])
            hr_mean_12h = float(w12["heart_rate"].mean())
            hr_slope_12h = _compute_slope(w12["heart_rate"])

            temp_last = float(group.loc[i, "temp_c"])
            temp_max_12h = float(w12["temp_c"].max())
            temp_slope_12h = _compute_slope(w12["temp_c"])

            rr_mean_12h = float(w12["resp_rate"].mean())
            spo2_min_12h = float(w12["spo2"].min())
            map_mean_12h = float(w12["map"].mean())
            map_min_12h = float(w12["map"].min())

            wbc_last = float(group.loc[i, "wbc"])
            wbc_t0 = float(w24["wbc"].iloc[0])
            wbc_change_24h = wbc_last - wbc_t0
            wbc_slope_24h = _compute_slope(w24["wbc"])

            plt_last = float(group.loc[i, "platelets"])
            plt_slope_24h = _compute_slope(w24["platelets"])

            cr_last = float(group.loc[i, "creatinine"])
            lactate_last = float(group.loc[i, "lactate"])

            row_dict = {
                "patient_id": patient_id,
                "hour_from_admission": h,
                "timestamp": group.loc[i, "timestamp"],
                "target_hai_next_24h": int(group.loc[i, "target_hai_next_24h"]),
                
                # Features
                "age": float(group.loc[i, "age"]),
                "gender_male": int(group.loc[i, "gender_male"]),
                "charlson_comorbidity_index": int(group.loc[i, "charlson_comorbidity_index"]),
                "recent_surgery": int(group.loc[i, "recent_surgery"]),
                
                "heart_rate_last": hr_last,
                "heart_rate_mean_12h": hr_mean_12h,
                "heart_rate_slope_12h": hr_slope_12h,
                "temp_c_last": temp_last,
                "temp_c_max_12h": temp_max_12h,
                "temp_c_slope_12h": temp_slope_12h,
                "resp_rate_mean_12h": rr_mean_12h,
                "spo2_min_12h": spo2_min_12h,
                "map_mean_12h": map_mean_12h,
                "map_min_12h": map_min_12h,
                
                "wbc_last": wbc_last,
                "wbc_change_24h": wbc_change_24h,
                "wbc_slope_24h": wbc_slope_24h,
                "platelets_last": plt_last,
                "platelets_slope_24h": plt_slope_24h,
                "creatinine_last": cr_last,
                "lactate_last": lactate_last,
                
                "cvc_duration_hours": float(group.loc[i, "cvc_duration_hours"]),
                "foley_duration_hours": float(group.loc[i, "foley_duration_hours"]),
                "vent_duration_hours": float(group.loc[i, "vent_duration_hours"]),
                "total_device_burden": int(group.loc[i, "total_device_burden"]),
                "broad_spec_antibiotics_72h": int(group.loc[i, "broad_spec_antibiotics_72h"])
            }
            feature_rows.append(row_dict)

    df_features = pd.DataFrame(feature_rows)
    return df_features
