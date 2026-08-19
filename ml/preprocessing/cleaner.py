import pandas as pd
import numpy as np
from typing import Dict, List, Tuple


PHYSIOLOGICAL_BOUNDS = {
    "heart_rate": (20.0, 240.0),
    "temp_c": (30.0, 43.0),
    "sbp": (40.0, 260.0),
    "dbp": (20.0, 160.0),
    "map": (30.0, 200.0),
    "resp_rate": (4.0, 60.0),
    "spo2": (50.0, 100.0),
    "wbc": (0.1, 100.0),
    "platelets": (5.0, 1000.0),
    "creatinine": (0.1, 20.0),
    "lactate": (0.1, 30.0),
}


def clean_clinical_timeseries(df_ts: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans ICU timeseries data:
    1. Clips non-physiological extreme values to clinical plausibility bounds
    2. Forward fills missing values per patient trajectory
    3. Backfills remaining initial missing values with population medians
    """
    df = df_ts.copy()

    # Sort strictly by patient and observation hour
    df = df.sort_values(by=["patient_id", "hour_from_admission"]).reset_index(drop=True)

    # 1. Clip physiological outliers
    for col, (min_val, max_val) in PHYSIOLOGICAL_BOUNDS.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=min_val, upper=max_val)

    # 2. Patient-level forward fill (EHR carry-forward assumption)
    numeric_cols = [c for c in df.columns if c in PHYSIOLOGICAL_BOUNDS or "duration" in c]
    df[numeric_cols] = df.groupby("patient_id")[numeric_cols].ffill()

    # 3. Global median backfill for any initial missingness
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)

    return df
