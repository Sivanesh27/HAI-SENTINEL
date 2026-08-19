import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from typing import Tuple, Dict, Any, List


def calibrate_model(base_estimator, X_val, y_val, method: str = "isotonic") -> CalibratedClassifierCV:
    """
    Fits a post-hoc probability calibrator on validation predictions.
    Using 'isotonic' for non-parametric step adjustment or 'sigmoid' (Platt scaling).
    """
    calibrator = CalibratedClassifierCV(estimator=base_estimator, method=method, cv="prefit")
    calibrator.fit(X_val, y_val)
    return calibrator


def compute_calibration_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10
) -> Dict[str, Any]:
    """
    Computes calibration curve bins and Expected Calibration Error (ECE).
    """
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")

    # Calculate Expected Calibration Error (ECE)
    bin_edges = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    bin_data = []

    for i in range(n_bins):
        bin_mask = (y_prob >= bin_edges[i]) & (y_prob < bin_edges[i + 1])
        bin_count = int(np.sum(bin_mask))
        if bin_count > 0:
            bin_acc = float(np.mean(y_true[bin_mask]))
            bin_conf = float(np.mean(y_prob[bin_mask]))
            ece += (bin_count / len(y_prob)) * abs(bin_acc - bin_conf)
            bin_data.append({
                "bin_index": i,
                "confidence_mean": round(bin_conf, 4),
                "accuracy_empirical": round(bin_acc, 4),
                "count": bin_count
            })

    return {
        "expected_calibration_error": round(float(ece), 4),
        "prob_true": [round(float(p), 4) for p in prob_true],
        "prob_pred": [round(float(p), 4) for p in prob_pred],
        "bins": bin_data
    }
