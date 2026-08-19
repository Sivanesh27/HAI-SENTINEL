import os
import pandas as pd
from typing import Tuple, Optional


def load_cohort_data(
    data_dir: str = "data/demo",
    meta_filename: str = "synthetic_patients_metadata.csv",
    ts_filename: str = "synthetic_icu_timeseries.csv"
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Loads and validates patient metadata and longitudinal timeseries.
    
    Returns:
        df_meta: DataFrame with static patient attributes
        df_ts: DataFrame with hourly observations
    """
    meta_path = os.path.join(data_dir, meta_filename)
    ts_path = os.path.join(data_dir, ts_filename)

    if not os.path.exists(meta_path) or not os.path.exists(ts_path):
        raise FileNotFoundError(
            f"Dataset files not found in {data_dir}. "
            "Run 'python data/demo/generate_clinical_cohort.py' first."
        )

    df_meta = pd.read_csv(meta_path)
    df_ts = pd.read_csv(ts_path)

    # Convert timestamps
    df_ts["timestamp"] = pd.to_datetime(df_ts["timestamp"])
    df_meta["admission_time"] = pd.to_datetime(df_meta["admission_time"])

    # Basic schema validations
    required_meta_cols = ["patient_id", "ward", "age", "gender", "develops_hai"]
    for col in required_meta_cols:
        if col not in df_meta.columns:
            raise ValueError(f"Missing required metadata column: {col}")

    required_ts_cols = [
        "patient_id", "hour_from_admission", "heart_rate", "temp_c", 
        "sbp", "dbp", "map", "resp_rate", "spo2", "wbc", "platelets", 
        "creatinine", "lactate", "target_hai_next_24h"
    ]
    for col in required_ts_cols:
        if col not in df_ts.columns:
            raise ValueError(f"Missing required timeseries column: {col}")

    return df_meta, df_ts
