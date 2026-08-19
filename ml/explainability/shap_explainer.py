import shap
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from ml.features.temporal_extractor import FEATURE_NAMES

CLINICAL_FEATURE_MAPPING = {
    "age": ("Demographics", "Patient Age"),
    "gender_male": ("Demographics", "Gender (Male)"),
    "charlson_comorbidity_index": ("Comorbidities", "Charlson Comorbidity Index"),
    "recent_surgery": ("Clinical History", "Recent Surgical Procedure"),
    "hour_from_admission": ("Hospital Stay", "ICU Duration (Hours)"),
    
    "heart_rate_last": ("Vital Signs", "Current Heart Rate"),
    "heart_rate_mean_12h": ("Vital Signs", "12h Mean Heart Rate"),
    "heart_rate_slope_12h": ("Vital Signs", "12h Heart Rate Velocity"),
    "temp_c_last": ("Vital Signs", "Current Temperature"),
    "temp_c_max_12h": ("Vital Signs", "12h Peak Temperature"),
    "temp_c_slope_12h": ("Vital Signs", "12h Temperature Upward Trend"),
    "resp_rate_mean_12h": ("Vital Signs", "12h Mean Respiratory Rate"),
    "spo2_min_12h": ("Vital Signs", "12h Nadir SpO2"),
    "map_mean_12h": ("Vital Signs", "12h Mean Arterial Pressure"),
    "map_min_12h": ("Vital Signs", "12h Nadir Blood Pressure"),
    
    "wbc_last": ("Laboratory", "Current White Blood Cell Count"),
    "wbc_change_24h": ("Laboratory", "24h Leukocytosis Delta"),
    "wbc_slope_24h": ("Laboratory", "24h WBC Upward Slope"),
    "platelets_last": ("Laboratory", "Current Platelet Count"),
    "platelets_slope_24h": ("Laboratory", "24h Platelet Trend (Consumption)"),
    "creatinine_last": ("Laboratory", "Current Serum Creatinine"),
    "lactate_last": ("Laboratory", "Current Serum Lactate"),
    
    "cvc_duration_hours": ("Invasive Devices", "Central Venous Catheter Exposure (hrs)"),
    "foley_duration_hours": ("Invasive Devices", "Urinary Catheter Exposure (hrs)"),
    "vent_duration_hours": ("Invasive Devices", "Mechanical Ventilation Exposure (hrs)"),
    "total_device_burden": ("Invasive Devices", "Concurrent Invasive Device Burden"),
    "broad_spec_antibiotics_72h": ("Medications", "Broad-Spectrum Antibiotic Exposure")
}


class HAISHAPExplainer:
    """
    TreeSHAP explainer for extracting local feature attributions on single-patient inferences.
    Distinguishes model feature contributions from causal statements.
    """
    def __init__(self, model, feature_names: List[str] = None):
        self.model = model
        self.feature_names = feature_names or FEATURE_NAMES
        self.explainer = shap.TreeExplainer(self.model)

    def explain_instance(
        self,
        feature_vector: np.ndarray,
        top_k: int = 6
    ) -> Dict[str, Any]:
        """
        Computes exact TreeSHAP values for a single 1D feature vector.
        
        Returns:
            - base_value: Expected model log-odds
            - top_positive_drivers: Features driving risk UP
            - top_negative_drivers: Features driving risk DOWN
            - full_attributions: All features with human-readable labels
        """
        if feature_vector.ndim == 1:
            x = feature_vector.reshape(1, -1)
        else:
            x = feature_vector

        shap_values = self.explainer.shap_values(x)
        
        # Handle binary classification output shape
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # Positive class SHAP
        elif shap_values.ndim == 2:
            sv = shap_values[0]
        else:
            sv = shap_values

        base_val = float(self.explainer.expected_value[1]) if isinstance(self.explainer.expected_value, (list, np.ndarray)) else float(self.explainer.expected_value)

        attributions = []
        for i, fname in enumerate(self.feature_names):
            val = float(x[0, i])
            shap_val = float(sv[i])
            category, display_name = CLINICAL_FEATURE_MAPPING.get(fname, ("General", fname))

            attributions.append({
                "feature_name": fname,
                "display_name": display_name,
                "category": category,
                "feature_value": round(val, 2),
                "shap_value": round(shap_val, 4),
                "contribution_direction": "ELEVATES_RISK" if shap_val > 0 else "REDUCES_RISK",
                "abs_importance": abs(shap_val)
            })

        # Sort by magnitude of contribution
        attributions_sorted = sorted(attributions, key=lambda d: d["abs_importance"], reverse=True)

        top_positive = [a for a in attributions_sorted if a["shap_value"] > 0][:top_k]
        top_negative = [a for a in attributions_sorted if a["shap_value"] < 0][:top_k]

        return {
            "base_value": round(base_val, 4),
            "top_positive_drivers": top_positive,
            "top_negative_drivers": top_negative,
            "all_attributions": attributions_sorted,
            "disclaimer": "Feature contributions represent statistical model attributions (TreeSHAP), NOT causal clinical mechanisms."
        }
