import numpy as np
from sklearn.calibration import calibration_curve
from typing import Tuple, Dict, Any, List


def calibrate_model(base_estimator, X_val, y_val, method: str = "isotonic"):
    """
    Fits a post-hoc probability calibrator on validation predictions.
    Fully compatible with all scikit-learn versions (1.0 through 1.9+).
    """
    # Attempt 1: Modern scikit-learn 1.4+ with FrozenEstimator
    try:
        from sklearn.calibration import FrozenEstimator, CalibratedClassifierCV
        frozen = FrozenEstimator(base_estimator)
        calibrator = CalibratedClassifierCV(estimator=frozen, method=method)
        calibrator.fit(X_val, y_val)
        return calibrator
    except (ImportError, TypeError, AttributeError, ValueError):
        pass

    # Attempt 2: Legacy scikit-learn with cv="prefit"
    try:
        from sklearn.calibration import CalibratedClassifierCV
        calibrator = CalibratedClassifierCV(estimator=base_estimator, method=method, cv="prefit")
        calibrator.fit(X_val, y_val)
        return calibrator
    except (TypeError, ValueError, AttributeError):
        pass

    # Attempt 3: Direct robust Isotonic / Platt calibrator wrapper
    from sklearn.isotonic import IsotonicRegression
    from sklearn.linear_model import LogisticRegression

    class UniversalCalibrator:
        def __init__(self, model, cal_method: str = "isotonic"):
            self.model = model
            self.method = cal_method
            if cal_method == "isotonic":
                self.regressor = IsotonicRegression(out_of_bounds="clip", y_min=0.0, y_max=1.0)
            else:
                self.regressor = LogisticRegression()

        def fit(self, X, y):
            raw_p = self.model.predict_proba(X)[:, 1]
            if self.method == "isotonic":
                self.regressor.fit(raw_p, y)
            else:
                self.regressor.fit(raw_p.reshape(-1, 1), y)
            return self

        def predict_proba(self, X):
            raw_p = self.model.predict_proba(X)[:, 1]
            if self.method == "isotonic":
                cal_p = self.regressor.transform(raw_p)
            else:
                cal_p = self.regressor.predict_proba(raw_p.reshape(-1, 1))[:, 1]
            cal_p = np.clip(cal_p, 0.0001, 0.9999)
            return np.column_stack([1.0 - cal_p, cal_p])

    cal = UniversalCalibrator(base_estimator, method)
    cal.fit(X_val, y_val)
    return cal


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
