import os
import joblib
import json
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from ml.features.temporal_extractor import FEATURE_NAMES
from ml.explainability.shap_explainer import HAISHAPExplainer


class HAIInferenceEngine:
    """
    Production inference engine for HAI-Sentinel.
    Provides calibrated risk prediction, uncertainty estimation, SHAP explainability,
    and non-causal scenario simulation.
    """
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.feature_names = FEATURE_NAMES
        self.base_model = None
        self.calibrated_model = None
        self.explainer = None
        self.metadata = None
        self._load_models()

    def _load_models(self):
        base_path = os.path.join(self.model_dir, "xgboost.joblib")
        cal_path = os.path.join(self.model_dir, "xgboost_calibrated.joblib")
        meta_path = os.path.join(self.model_dir, "model_metadata.json")

        if os.path.exists(base_path) and os.path.exists(cal_path):
            self.base_model = joblib.load(base_path)
            self.calibrated_model = joblib.load(cal_path)
            self.explainer = HAISHAPExplainer(self.base_model, self.feature_names)
        
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)

    @property
    def is_ready(self) -> bool:
        return self.calibrated_model is not None and self.explainer is not None

    def _prepare_vector(self, feature_dict: Dict[str, Any]) -> Tuple[np.ndarray, float]:
        """Constructs ordered feature vector and tracks missing features."""
        vec = []
        missing_count = 0
        for name in self.feature_names:
            if name in feature_dict and feature_dict[name] is not None:
                vec.append(float(feature_dict[name]))
            else:
                vec.append(0.0)
                missing_count += 1
        
        completeness = max(0.0, min(100.0, ((len(self.feature_names) - missing_count) / len(self.feature_names)) * 100))
        return np.array(vec, dtype=np.float32), completeness

    def predict_patient_state(
        self,
        feature_dict: Dict[str, Any],
        include_shap: bool = True
    ) -> Dict[str, Any]:
        """
        Executes calibrated inference for a patient clinical state.
        
        Returns:
            - calibrated_risk_pct: Posterior risk probability (0-100%)
            - risk_category: LOW | MODERATE | HIGH | CRITICAL
            - confidence_level: HIGH | MODERATE | LOW (derived from data completeness)
            - data_completeness_pct: Percentage of required features populated
            - shap_explanation: Local positive/negative driver attributions
        """
        if not self.is_ready:
            raise RuntimeError("Inference engine models not loaded. Train models first.")

        vec, completeness = self._prepare_vector(feature_dict)
        x = vec.reshape(1, -1)

        # Predict calibrated probability
        cal_prob = float(self.calibrated_model.predict_proba(x)[0, 1])
        risk_pct = round(cal_prob * 100, 1)

        # Categorize
        if risk_pct >= 80.0:
            category = "CRITICAL"
        elif risk_pct >= 60.0:
            category = "HIGH"
        elif risk_pct >= 30.0:
            category = "MODERATE"
        else:
            category = "LOW"

        # Estimate confidence based on data completeness
        if completeness >= 85.0:
            confidence = "HIGH"
            uncertainty_margin = round(risk_pct * 0.05, 1)
        elif completeness >= 65.0:
            confidence = "MODERATE"
            uncertainty_margin = round(risk_pct * 0.12, 1)
        else:
            confidence = "LOW"
            uncertainty_margin = round(risk_pct * 0.25, 1)

        result = {
            "calibrated_risk_pct": risk_pct,
            "raw_probability": round(cal_prob, 4),
            "risk_category": category,
            "confidence_level": confidence,
            "data_completeness_pct": round(completeness, 1),
            "uncertainty_interval": [
                max(0.0, round(risk_pct - uncertainty_margin, 1)),
                min(100.0, round(risk_pct + uncertainty_margin, 1))
            ],
            "model_version": self.metadata.get("version", "1.0.0") if self.metadata else "1.0.0"
        }

        if include_shap:
            result["explanation"] = self.explainer.explain_instance(vec)

        return result

    def simulate_what_if(
        self,
        base_features: Dict[str, Any],
        perturbed_features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Simulates model output under hypothetical feature modifications.
        Explicitly frames result as NON-CAUSAL SCENARIO ANALYSIS.
        """
        base_res = self.predict_patient_state(base_features, include_shap=False)
        
        # Merge perturbation
        sim_features = base_features.copy()
        sim_features.update(perturbed_features)
        
        sim_res = self.predict_patient_state(sim_features, include_shap=True)

        delta_risk = round(sim_res["calibrated_risk_pct"] - base_res["calibrated_risk_pct"], 1)

        return {
            "baseline_risk_pct": base_res["calibrated_risk_pct"],
            "simulated_risk_pct": sim_res["calibrated_risk_pct"],
            "delta_risk_pct": delta_risk,
            "baseline_category": base_res["risk_category"],
            "simulated_category": sim_res["risk_category"],
            "simulated_explanation": sim_res.get("explanation"),
            "scientific_disclaimer": (
                "MODEL-BASED SCENARIO SIMULATION — NOT A CAUSAL CLINICAL PREDICTION. "
                "This output represents mathematical model behavior under altered input assumptions "
                "and must not be interpreted as evidence that changing clinical variables will cause the displayed risk reduction."
            )
        }


_ENGINE_INSTANCE: Optional[HAIInferenceEngine] = None


def get_inference_engine() -> HAIInferenceEngine:
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        _ENGINE_INSTANCE = HAIInferenceEngine()
    return _ENGINE_INSTANCE
