import os
import json
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from ml.inference.engine import get_inference_engine

router = APIRouter(prefix="/api/model", tags=["Model Governance & Scenario Simulator"])


class ScenarioRequest(BaseModel):
    patient_id: str = Field(default="DEMO-1042")
    base_features: Dict[str, Any]
    perturbed_features: Dict[str, Any]


@router.get("/performance", response_model=Dict[str, Any])
def get_model_performance():
    """
    Returns primary model evaluation curves (ROC, Precision-Recall, Calibration) and validation metrics.
    """
    eval_path = os.path.join("models", "xgboost_evaluation.json")
    meta_path = os.path.join("models", "model_metadata.json")

    if not os.path.exists(eval_path) or not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail="Model evaluation artifacts not found. Run training pipeline first.")

    with open(eval_path, "r") as f:
        eval_data = json.load(f)

    with open(meta_path, "r") as f:
        meta_data = json.load(f)

    return {
        "metadata": meta_data,
        "metrics": eval_data["metrics"],
        "calibration": eval_data["calibration"],
        "roc_curve": eval_data["roc_curve"],
        "pr_curve": eval_data["pr_curve"],
        "confusion_matrix": eval_data["confusion_matrix"]
    }


@router.get("/comparison", response_model=List[Dict[str, Any]])
def get_model_comparison():
    """
    Returns comparative validation metrics across Logistic Regression, Random Forest, and XGBoost.
    """
    comp_path = os.path.join("models", "model_comparison.json")
    if not os.path.exists(comp_path):
        raise HTTPException(status_code=404, detail="Model comparison artifact not found.")

    with open(comp_path, "r") as f:
        comp_data = json.load(f)

    return comp_data


@router.post("/scenario", response_model=Dict[str, Any])
def run_scenario_simulation(req: ScenarioRequest):
    """
    Executes a model-based what-if counterfactual scenario simulation.
    Frames all outputs strictly with non-causal scientific disclaimers.
    """
    engine = get_inference_engine()
    if not engine.is_ready:
        raise HTTPException(status_code=503, detail="Inference engine not ready.")

    sim_res = engine.simulate_what_if(req.base_features, req.perturbed_features)
    sim_res["patient_id"] = req.patient_id
    return sim_res
