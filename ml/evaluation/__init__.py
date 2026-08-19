"""
Evaluation package for HAI-Sentinel
"""
from .metrics import compute_classification_metrics
from .calibration import calibrate_model, compute_calibration_curve
from .plots import generate_evaluation_artifacts

__all__ = [
    "compute_classification_metrics",
    "calibrate_model",
    "compute_calibration_curve",
    "generate_evaluation_artifacts"
]
