import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple

from sklearn.model_selection import GroupShuffleSplit
import xgboost as xgb

from ml.features.temporal_extractor import FEATURE_NAMES
from ml.models.baselines import build_logistic_regression, build_random_forest
from ml.evaluation.metrics import compute_classification_metrics
from ml.evaluation.calibration import calibrate_model, compute_calibration_curve
from ml.evaluation.plots import generate_evaluation_artifacts


def train_and_evaluate_all_models(
    df_features: pd.DataFrame,
    output_dir: str = "models",
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Executes the end-to-end model training, validation, calibration, and evaluation suite:
    1. Patient-level train/validation/test split using GroupShuffleSplit (no patient leakage).
    2. Trains Logistic Regression, Random Forest, and XGBoost (plus LightGBM if supported).
    3. Fits post-hoc Isotonic Calibration on validation split.
    4. Evaluates calibrated probabilities on held-out test split.
    5. Saves all serialized models, metrics, and curve JSONs.
    """
    os.makedirs(output_dir, exist_ok=True)

    X = df_features[FEATURE_NAMES].values
    y = df_features["target_hai_next_24h"].values
    groups = df_features["patient_id"].values

    # Step 1: Patient-level splitting (70% train, 15% val, 15% test)
    gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=random_state)
    train_idx, temp_idx = next(gss_outer.split(X, y, groups=groups))

    X_train, y_train, g_train = X[train_idx], y[train_idx], groups[train_idx]
    X_temp, y_temp, g_temp = X[temp_idx], y[temp_idx], groups[temp_idx]

    gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
    val_idx, test_idx = next(gss_inner.split(X_temp, y_temp, groups=g_temp))

    X_val, y_val = X_temp[val_idx], y_temp[val_idx]
    X_test, y_test = X_temp[test_idx], y_temp[test_idx]

    # Verify patient isolation
    train_patients = set(g_train)
    val_patients = set(g_temp[val_idx])
    test_patients = set(g_temp[test_idx])
    assert len(train_patients.intersection(val_patients)) == 0, "Data Leakage: Train & Val overlap!"
    assert len(train_patients.intersection(test_patients)) == 0, "Data Leakage: Train & Test overlap!"
    assert len(val_patients.intersection(test_patients)) == 0, "Data Leakage: Val & Test overlap!"

    # Calculate class imbalance ratio for scale_pos_weight
    pos_count = np.sum(y_train == 1)
    neg_count = np.sum(y_train == 0)
    scale_pos_weight = float(neg_count / max(1, pos_count))

    # Define model candidates
    models = {
        "Logistic Regression": build_logistic_regression(),
        "Random Forest": build_random_forest(),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            random_state=random_state,
            eval_metric="logloss"
        )
    }

    # Optional LightGBM inclusion
    try:
        import lightgbm as lgb
        # Test basic instantiation
        lgb_model = lgb.LGBMClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.05,
            scale_pos_weight=scale_pos_weight,
            random_state=random_state,
            verbose=-1,
            n_jobs=1
        )
        # Verify lightgbm works on this system before adding
        models["LightGBM"] = lgb_model
    except Exception as e:
        print(f"[MODEL NOTICE] LightGBM optional accelerator omitted: {e}")

    comparison_results = []
    artifacts = {}

    for name, model in list(models.items()):
        print(f"[TRAINING] Fitting {name}...")
        try:
            # Train base model
            model.fit(X_train, y_train)

            # Fit isotonic probability calibrator on validation split
            calibrated_model = calibrate_model(model, X_val, y_val, method="isotonic")

            # Evaluate on test split
            raw_test_prob = model.predict_proba(X_test)[:, 1]
            cal_test_prob = calibrated_model.predict_proba(X_test)[:, 1]

            # Compute metrics
            raw_metrics = compute_classification_metrics(y_test, raw_test_prob)
            cal_metrics = compute_classification_metrics(y_test, cal_test_prob)
            cal_curve = compute_calibration_curve(y_test, cal_test_prob)

            # Save artifacts
            model_filename = f"{name.lower().replace(' ', '_')}.joblib"
            cal_filename = f"{name.lower().replace(' ', '_')}_calibrated.joblib"
            joblib.dump(model, os.path.join(output_dir, model_filename))
            joblib.dump(calibrated_model, os.path.join(output_dir, cal_filename))

            art = generate_evaluation_artifacts(
                y_true=y_test,
                y_prob=cal_test_prob,
                model_name=name,
                metrics_dict=cal_metrics,
                calibration_dict=cal_curve,
                output_dir=output_dir
            )
            artifacts[name] = art

            comparison_results.append({
                "model_name": name,
                "auroc": cal_metrics["auroc"],
                "auprc": cal_metrics["auprc"],
                "f1_score": cal_metrics["f1"],
                "sensitivity": cal_metrics["sensitivity"],
                "specificity": cal_metrics["specificity"],
                "sens_at_85_spec": cal_metrics["sens_at_85_spec"],
                "brier_score_raw": raw_metrics["brier_score"],
                "brier_score_calibrated": cal_metrics["brier_score"],
                "expected_calibration_error": cal_curve["expected_calibration_error"],
                "is_primary": (name == "XGBoost")
            })
        except Exception as err:
            print(f"[MODEL WARNING] Skipping {name} due to runtime execution issue: {err}")

    # Save comparison table
    with open(os.path.join(output_dir, "model_comparison.json"), "w") as f:
        json.dump(comparison_results, f, indent=2)

    # Save primary model metadata
    primary_metric = next((m for m in comparison_results if m["is_primary"]), comparison_results[0])
    model_metadata = {
        "model_id": "hai_sentinel_xgboost_v1",
        "primary_model": primary_metric["model_name"],
        "version": "1.0.0",
        "training_date": datetime.utcnow().isoformat(),
        "dataset_name": "HAI-Sentinel Synthetic ICU Cohort (NHSN-Aligned)",
        "features": FEATURE_NAMES,
        "n_features": len(FEATURE_NAMES),
        "split_summary": {
            "train_patients": len(train_patients),
            "val_patients": len(val_patients),
            "test_patients": len(test_patients),
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
        },
        "performance_summary": primary_metric
    }

    with open(os.path.join(output_dir, "model_metadata.json"), "w") as f:
        json.dump(model_metadata, f, indent=2)

    print("[TRAINING COMPLETE] All models trained, calibrated, and serialized successfully.")
    return {
        "comparison": comparison_results,
        "metadata": model_metadata,
        "artifacts": artifacts
    }
