import pytest
import numpy as np
import pandas as pd
import os

from ml.preprocessing.data_loader import load_cohort_data
from ml.preprocessing.cleaner import clean_clinical_timeseries
from ml.features.temporal_extractor import extract_temporal_features, FEATURE_NAMES
from ml.inference.engine import get_inference_engine


def test_data_loading_and_cleaning():
    """Verify data loading schema and physiological outlier clipping."""
    df_meta, df_ts = load_cohort_data()
    assert len(df_meta) >= 100
    assert len(df_ts) >= 5000
    
    df_clean = clean_clinical_timeseries(df_ts)
    assert not df_clean["heart_rate"].isnull().any()
    assert not df_clean["temp_c"].isnull().any()
    assert (df_clean["temp_c"] >= 30.0).all() and (df_clean["temp_c"] <= 43.0).all()


def test_temporal_feature_extraction_no_leakage():
    """Verify that temporal features do not contain future observations."""
    df_meta, df_ts = load_cohort_data()
    df_clean = clean_clinical_timeseries(df_ts)
    
    df_features = extract_temporal_features(df_meta, df_clean, min_observation_hours=12)
    assert len(df_features) > 0
    
    # Check all expected feature columns exist
    for col in FEATURE_NAMES:
        assert col in df_features.columns, f"Missing feature: {col}"
    
    assert "target_hai_next_24h" in df_features.columns


def test_inference_engine_prediction_output():
    """Verify calibrated inference engine returns required structure, confidence, and SHAP attributions."""
    engine = get_inference_engine()
    assert engine.is_ready, "Inference engine should be initialized and ready."

    # Sample high-risk clinical state vector with all features
    sample_features = {
        "age": 72.0,
        "gender_male": 1,
        "charlson_comorbidity_index": 4,
        "recent_surgery": 1,
        "hour_from_admission": 60.0,
        "heart_rate_last": 114.0,
        "heart_rate_mean_12h": 108.0,
        "heart_rate_slope_12h": 1.2,
        "temp_c_last": 38.6,
        "temp_c_max_12h": 38.7,
        "temp_c_slope_12h": 0.08,
        "resp_rate_mean_12h": 26.0,
        "spo2_min_12h": 91.0,
        "map_mean_12h": 68.0,
        "map_min_12h": 62.0,
        "wbc_last": 18.4,
        "wbc_change_24h": 8.2,
        "wbc_slope_24h": 0.35,
        "platelets_last": 95.0,
        "platelets_slope_24h": -2.1,
        "creatinine_last": 2.1,
        "lactate_last": 2.8,
        "cvc_duration_hours": 72.0,
        "foley_duration_hours": 72.0,
        "vent_duration_hours": 48.0,
        "total_device_burden": 3,
        "broad_spec_antibiotics_72h": 1
    }

    result = engine.predict_patient_state(sample_features, include_shap=True)

    assert "calibrated_risk_pct" in result
    assert 0.0 <= result["calibrated_risk_pct"] <= 100.0
    assert result["risk_category"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert result["confidence_level"] in ["LOW", "MODERATE", "HIGH"]
    assert result["data_completeness_pct"] == 100.0
    assert len(result["uncertainty_interval"]) == 2

    # Verify SHAP explanation
    explanation = result["explanation"]
    assert "top_positive_drivers" in explanation
    assert "top_negative_drivers" in explanation
    assert "disclaimer" in explanation
    assert len(explanation["top_positive_drivers"]) > 0

    # Verify partial missingness reduces confidence
    partial_features = {
        "age": 65.0,
        "heart_rate_last": 90.0,
        "temp_c_last": 37.5
    }
    partial_res = engine.predict_patient_state(partial_features, include_shap=False)
    assert partial_res["data_completeness_pct"] < 50.0
    assert partial_res["confidence_level"] == "LOW"


def test_what_if_simulation_non_causal():
    """Verify non-causal scenario simulation calculates delta risk and contains scientific disclaimers."""
    engine = get_inference_engine()
    
    base_features = {
        "age": 68.0,
        "gender_male": 1,
        "charlson_comorbidity_index": 3,
        "recent_surgery": 0,
        "hour_from_admission": 48.0,
        "heart_rate_last": 95.0,
        "heart_rate_mean_12h": 92.0,
        "heart_rate_slope_12h": 0.5,
        "temp_c_last": 38.2,
        "temp_c_max_12h": 38.3,
        "temp_c_slope_12h": 0.04,
        "resp_rate_mean_12h": 22.0,
        "spo2_min_12h": 94.0,
        "map_mean_12h": 78.0,
        "map_min_12h": 72.0,
        "wbc_last": 14.5,
        "wbc_change_24h": 4.5,
        "wbc_slope_24h": 0.15,
        "platelets_last": 140.0,
        "platelets_slope_24h": -1.0,
        "creatinine_last": 1.4,
        "lactate_last": 1.8,
        "cvc_duration_hours": 96.0,
        "foley_duration_hours": 96.0,
        "vent_duration_hours": 72.0,
        "total_device_burden": 3,
        "broad_spec_antibiotics_72h": 1
    }

    # Simulate scenario: reducing device exposures and normalized vitals
    hypothetical_changes = {
        "cvc_duration_hours": 0.0,
        "foley_duration_hours": 0.0,
        "vent_duration_hours": 0.0,
        "total_device_burden": 0,
        "temp_c_last": 37.0,
        "wbc_last": 8.0,
    }

    sim = engine.simulate_what_if(base_features, hypothetical_changes)

    assert "baseline_risk_pct" in sim
    assert "simulated_risk_pct" in sim
    assert "delta_risk_pct" in sim
    assert "scientific_disclaimer" in sim
    assert "NOT A CAUSAL CLINICAL PREDICTION" in sim["scientific_disclaimer"]
