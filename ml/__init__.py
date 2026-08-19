"""
HAI-Sentinel Machine Learning Module
"""
import os

FEATURE_COLUMNS = [
    "age",
    "gender_male",
    "icu_los_hours",
    "charlson_comorbidity_index",
    "heart_rate_mean_12h",
    "heart_rate_slope_12h",
    "temp_c_max_12h",
    "temp_c_slope_12h",
    "resp_rate_mean_12h",
    "spo2_min_12h",
    "map_mean_12h",
    "wbc_last",
    "wbc_change_24h",
    "platelets_last",
    "platelets_slope_24h",
    "creatinine_last",
    "lactate_last",
    "cvc_duration_hours",
    "foley_duration_hours",
    "vent_duration_hours",
    "total_device_burden",
    "broad_spec_antibiotics_72h",
    "recent_surgery",
]
