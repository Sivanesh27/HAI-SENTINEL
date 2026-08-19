import numpy as np
import json
import os
from sklearn.metrics import roc_curve, precision_recall_curve
from typing import Dict, Any


def generate_evaluation_artifacts(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    model_name: str,
    metrics_dict: Dict[str, Any],
    calibration_dict: Dict[str, Any],
    output_dir: str = "models"
) -> Dict[str, Any]:
    """
    Generates structured curve data for frontend rendering (Recharts / Plotly):
    1. ROC curve data points
    2. Precision-Recall curve data points
    3. Calibration curve bins
    4. Metrics summary & model metadata
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. ROC Curve
    fpr, tpr, roc_thresh = roc_curve(y_true, y_prob)
    # Downsample points for efficient web payload
    step = max(1, len(fpr) // 50)
    roc_points = [
        {"fpr": round(float(f), 4), "tpr": round(float(t), 4), "threshold": round(float(th), 4)}
        for f, t, th in zip(fpr[::step], tpr[::step], roc_thresh[::step])
    ]
    # Ensure end point
    roc_points.append({"fpr": 1.0, "tpr": 1.0, "threshold": 0.0})

    # 2. PR Curve
    prec, rec, pr_thresh = precision_recall_curve(y_true, y_prob)
    pr_step = max(1, len(prec) // 50)
    pr_points = [
        {"recall": round(float(r), 4), "precision": round(float(p), 4)}
        for p, r in zip(prec[::pr_step], rec[::pr_step])
    ]

    artifact = {
        "model_name": model_name,
        "metrics": metrics_dict,
        "calibration": calibration_dict,
        "roc_curve": roc_points,
        "pr_curve": pr_points,
        "confusion_matrix": metrics_dict["confusion_matrix"]
    }

    out_file = os.path.join(output_dir, f"{model_name.lower().replace(' ', '_')}_evaluation.json")
    with open(out_file, "w") as f:
        json.dump(artifact, f, indent=2)

    return artifact
