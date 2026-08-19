"""
Database Initialization & Seeder Script for HAI-Sentinel
Populates database tables from the synthetic cohort and runs the initial risk engine.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session

from backend.database import engine, Base, SessionLocal
from backend.models import Ward, Patient, Encounter, VitalSign, RiskPrediction
from backend.services.risk_engine import get_trajectory_engine
from ml.preprocessing.data_loader import load_cohort_data
from ml.preprocessing.cleaner import clean_clinical_timeseries


def seed_database():
    print("[DB SEEDER] Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Patient).count() > 0:
            print(f"[DB SEEDER] Database already contains {db.query(Patient).count()} patients. Skipping seed.")
            return

        print("[DB SEEDER] Loading cohort datasets...")
        df_meta, df_ts = load_cohort_data()
        df_ts_clean = clean_clinical_timeseries(df_ts)

        # 1. Seed Wards
        wards_dict = {
            "ICU-A (Medical)": ("ICU-A", "MICU", 24, "HIGH"),
            "ICU-B (Surgical)": ("ICU-B", "SICU", 24, "MODERATE"),
            "ICU-C (Cardiac)": ("ICU-C", "CCU", 20, "LOW"),
            "Ward-3 (Stepdown)": ("Ward-3", "Stepdown", 32, "LOW"),
        }
        for w_name, (w_id, u_type, beds, status) in wards_dict.items():
            ward_obj = Ward(id=w_id, name=w_name, unit_type=u_type, bed_count=beds, risk_status=status)
            db.merge(ward_obj)
        db.commit()

        # 2. Seed Patients, Encounters, and Vitals
        print(f"[DB SEEDER] Seeding {len(df_meta)} patients and historical time series...")
        trajectory_engine = get_trajectory_engine()

        for _, row in df_meta.iterrows():
            p_id = str(row["patient_id"])
            w_raw = str(row["ward"])
            w_id = wards_dict.get(w_raw, ("ICU-A", "", 0, ""))[0]

            patient = Patient(
                id=p_id,
                mrn=f"MRN-{p_id.replace('DEMO-', '')}",
                first_name="Fictional",
                last_name=f"Patient-{p_id.replace('DEMO-', '')}",
                gender=str(row["gender"]),
                age=int(row["age"]),
                charlson_comorbidity_index=int(row["charlson_comorbidity_index"]),
                recent_surgery=bool(row["recent_surgery"]),
                is_demo_patient=bool(row["is_demo_patient"])
            )
            db.add(patient)

            enc_id = f"ENC-{p_id}"
            encounter = Encounter(
                id=enc_id,
                patient_id=p_id,
                ward_id=w_id,
                bed=str(row["bed"]),
                admission_time=pd.to_datetime(row["admission_time"]),
                status="ACTIVE",
                primary_diagnosis="Critical Care Surveillance"
            )
            db.add(encounter)

            # Insert vitals for this patient
            patient_ts = df_ts_clean[df_ts_clean["patient_id"] == p_id].sort_values(by="hour_from_admission")
            vitals_records = []

            for _, ts_row in patient_ts.iterrows():
                v = VitalSign(
                    encounter_id=enc_id,
                    timestamp=pd.to_datetime(ts_row["timestamp"]),
                    hour_from_admission=int(ts_row["hour_from_admission"]),
                    heart_rate=float(ts_row["heart_rate"]),
                    temp_c=float(ts_row["temp_c"]),
                    sbp=float(ts_row["sbp"]),
                    dbp=float(ts_row["dbp"]),
                    map=float(ts_row["map"]),
                    resp_rate=float(ts_row["resp_rate"]),
                    spo2=float(ts_row["spo2"]),
                    wbc=float(ts_row["wbc"]),
                    platelets=float(ts_row["platelets"]),
                    creatinine=float(ts_row["creatinine"]),
                    lactate=float(ts_row["lactate"]),
                    cvc_duration_hours=float(ts_row["cvc_duration_hours"]),
                    foley_duration_hours=float(ts_row["foley_duration_hours"]),
                    vent_duration_hours=float(ts_row["vent_duration_hours"]),
                    total_device_burden=int(ts_row["total_device_burden"]),
                    broad_spec_antibiotics_72h=int(ts_row["broad_spec_antibiotics_72h"])
                )
                db.add(v)
                vitals_records.append({
                    "timestamp": ts_row["timestamp"].isoformat() if hasattr(ts_row["timestamp"], "isoformat") else str(ts_row["timestamp"]),
                    "hour_from_admission": int(ts_row["hour_from_admission"]),
                    "heart_rate": float(ts_row["heart_rate"]),
                    "temp_c": float(ts_row["temp_c"]),
                    "sbp": float(ts_row["sbp"]),
                    "dbp": float(ts_row["dbp"]),
                    "map": float(ts_row["map"]),
                    "resp_rate": float(ts_row["resp_rate"]),
                    "spo2": float(ts_row["spo2"]),
                    "wbc": float(ts_row["wbc"]),
                    "platelets": float(ts_row["platelets"]),
                    "creatinine": float(ts_row["creatinine"]),
                    "lactate": float(ts_row["lactate"]),
                    "cvc_duration_hours": float(ts_row["cvc_duration_hours"]),
                    "foley_duration_hours": float(ts_row["foley_duration_hours"]),
                    "vent_duration_hours": float(ts_row["vent_duration_hours"]),
                    "total_device_burden": int(ts_row["total_device_burden"]),
                    "broad_spec_antibiotics_72h": int(ts_row["broad_spec_antibiotics_72h"])
                })

            # Calculate and store the risk prediction summary
            p_meta_dict = {
                "patient_id": p_id,
                "age": int(row["age"]),
                "gender": str(row["gender"]),
                "charlson_comorbidity_index": int(row["charlson_comorbidity_index"]),
                "recent_surgery": bool(row["recent_surgery"])
            }
            traj_res = trajectory_engine.process_patient_trajectory(p_meta_dict, vitals_records)

            pred_record = RiskPrediction(
                encounter_id=enc_id,
                timestamp=pd.to_datetime(traj_res["timestamp"]),
                hour_from_admission=traj_res["trajectory"][-1]["hour_from_admission"],
                model_version=traj_res["model_version"],
                calibrated_risk_pct=traj_res["current_risk"],
                risk_category=traj_res["risk_category"],
                risk_delta_6h=traj_res["risk_delta_6h"],
                risk_delta_12h=traj_res["risk_delta_12h"],
                risk_delta_24h=traj_res["risk_delta_24h"],
                risk_velocity_12h=traj_res["risk_velocity"],
                risk_acceleration_12h=traj_res["risk_acceleration"],
                rapid_escalation=traj_res["rapid_escalation"],
                confidence_level=traj_res["confidence"],
                data_completeness_pct=traj_res["data_completeness_pct"],
                review_priority=traj_res["review_priority"],
                top_positive_drivers_json=json.dumps(traj_res["top_features"]["top_positive_drivers"]) if traj_res["top_features"] else None,
                top_negative_drivers_json=json.dumps(traj_res["top_features"]["top_negative_drivers"]) if traj_res["top_features"] else None,
            )
            db.add(pred_record)

        db.commit()
        print("[DB SEEDER] Successfully populated database with all patients, encounters, and risk predictions.")

    except Exception as e:
        db.rollback()
        print(f"[DB SEEDER ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
