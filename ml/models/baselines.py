from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def build_logistic_regression() -> Pipeline:
    """
    Constructs a calibrated L2-regularized Logistic Regression baseline pipeline with feature scaling.
    """
    return Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(
            penalty="l2",
            C=0.1,
            class_weight="balanced",
            max_iter=1000,
            random_state=42
        ))
    ])


def build_random_forest() -> RandomForestClassifier:
    """
    Constructs a Random Forest baseline classifier with balanced class weighting.
    """
    return RandomForestClassifier(
        n_estimators=150,
        max_depth=6,
        min_samples_split=8,
        min_samples_leaf=4,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42
    )
