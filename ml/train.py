"""
Main training entrypoint for HAI-Sentinel ML Pipeline.
Enables execution via: python -m ml.train
"""
import os
import sys

# Ensure project root is on sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from ml.preprocessing.data_loader import load_cohort_data
from ml.preprocessing.cleaner import clean_clinical_timeseries
from ml.features.temporal_extractor import extract_temporal_features
from ml.models.trainer import train_and_evaluate_all_models


def main():
    print("==================================================")
    print("  HAI-SENTINEL ML TRAINING & ISOTONIC CALIBRATION ")
    print("==================================================")
    
    # 1. Load data
    print("\n[STEP 1] Ingesting cohort data...")
    df_meta, df_ts = load_cohort_data()
    print(f"Loaded {len(df_meta)} patient records and {len(df_ts)} timeseries observations.")

    # 2. Clean timeseries
    print("\n[STEP 2] Preprocessing & physiological bounds checking...")
    df_ts_clean = clean_clinical_timeseries(df_ts)

    # 3. Temporal feature engineering
    print("\n[STEP 3] Extracting causal backward-looking rolling features & slopes...")
    df_features = extract_temporal_features(df_meta, df_ts_clean, min_observation_hours=12)
    print(f"Generated feature matrix with {len(df_features)} samples across {df_features.shape[1]} columns.")

    # 4. Train, calibrate, and evaluate
    print("\n[STEP 4] Training, calibrating, and evaluating models with patient-level isolation...")
    results = train_and_evaluate_all_models(df_features, output_dir="models")

    # 5. Summary printout
    print("\n==================================================")
    print("         MODEL COMPARISON SUMMARY (TEST SET)      ")
    print("==================================================")
    print(f"{'Model':<22} | {'AUROC':<7} | {'AUPRC':<7} | {'F1':<6} | {'Sens@85Spec':<11} | {'Brier (Cal)':<11} | {'ECE':<6}")
    print("-" * 85)
    for m in results["comparison"]:
        print(f"{m['model_name']:<22} | {m['auroc']:<7.4f} | {m['auprc']:<7.4f} | {m['f1_score']:<6.4f} | {m['sens_at_85_spec']:<11.4f} | {m['brier_score_calibrated']:<11.4f} | {m['expected_calibration_error']:<6.4f}")
    print("==================================================")
    print("Pipeline completed successfully. Artifacts written to 'models/'.")


if __name__ == "__main__":
    main()
