import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.database import get_db
from backend.models import Patient, Encounter, VitalSign, RiskPrediction, Ward
from backend.services.risk_engine import get_trajectory_engine

router = APIRouter(prefix="/api/patients", tags=["Patients & Trajectories"])


@router.get("", response_model=Dict[str, Any])
def list_patients(
    ward: Optional[str] = Query(None, description="Filter by ward ID (e.g. ICU-A)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk category (LOW, MODERATE, HIGH, CRITICAL)"),
    rapid_escalation: Optional[bool] = Query(None, description="Filter rapidly escalating trajectories"),
    review_priority: Optional[int] = Query(None, description="Filter by review priority (1, 2, 3)"),
    limit: int = Query(50, ge=1, le=250),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns a sortable, filterable list of monitored patients with dynamic risk velocity metrics.
    """
    query = (
        db.query(Patient, Encounter, RiskPrediction, Ward)
        .join(Encounter, Patient.id == Encounter.patient_id)
        .join(RiskPrediction, Encounter.id == RiskPrediction.encounter_id)
        .join(Ward, Encounter.ward_id == Ward.id)
    )

    if ward:
        query = query.filter(Encounter.ward_id == ward)
    if risk_level:
        query = query.filter(RiskPrediction.risk_category == risk_level.upper())
    if rapid_escalation is not None:
        query = query.filter(RiskPrediction.rapid_escalation == rapid_escalation)
    if review_priority is not None:
        query = query.filter(RiskPrediction.review_priority == review_priority)

    # Sort by priority first (Priority 1 first), then by risk percentage descending
    query = query.order_by(RiskPrediction.review_priority.asc(), RiskPrediction.calibrated_risk_pct.desc())

    total_count = query.count()
    results = query.offset(offset).limit(limit).all()

    patient_items = []
    for p, enc, pred, w in results:
        top_pos = json.loads(pred.top_positive_drivers_json) if pred.top_positive_drivers_json else []
        drivers = [d.get("display_name", d.get("feature_name")) for d in top_pos[:3]]

        patient_items.append({
            "patient_id": p.id,
            "mrn": p.mrn,
            "ward_id": enc.ward_id,
            "ward_name": w.name,
            "bed": enc.bed,
            "age": p.age,
            "gender": p.gender,
            "admission_time": enc.admission_time.isoformat(),
            "icu_los_hours": pred.hour_from_admission,
            "current_risk": pred.calibrated_risk_pct,
            "risk_category": pred.risk_category,
            "risk_velocity": pred.risk_velocity_12h,
            "risk_velocity_label": f"{pred.risk_delta_12h:+.1f}% / 12h",
            "risk_delta_12h": pred.risk_delta_12h,
            "risk_acceleration": pred.risk_acceleration_12h,
            "rapid_escalation": pred.rapid_escalation,
            "review_priority": pred.review_priority,
            "confidence_level": pred.confidence_level,
            "data_completeness_pct": pred.data_completeness_pct,
            "primary_drivers": drivers,
            "last_update": pred.timestamp.isoformat(),
            "is_demo_patient": p.is_demo_patient
        })

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "patients": patient_items
    }


@router.get("/{patient_id}", response_model=Dict[str, Any])
def get_patient_detail(
    patient_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns patient demographics, clinical encounter details, and current state overview.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")

    encounter = db.query(Encounter).filter(Encounter.patient_id == patient_id).first()
    ward = db.query(Ward).filter(Ward.id == encounter.ward_id).first() if encounter else None
    pred = db.query(RiskPrediction).filter(RiskPrediction.encounter_id == encounter.id).first() if encounter else None

    # Fetch latest vitals
    latest_vital = (
        db.query(VitalSign)
        .filter(VitalSign.encounter_id == encounter.id)
        .order_by(VitalSign.hour_from_admission.desc())
        .first()
    ) if encounter else None

    return {
        "patient_id": patient.id,
        "mrn": patient.mrn,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "age": patient.age,
        "gender": patient.gender,
        "charlson_comorbidity_index": patient.charlson_comorbidity_index,
        "recent_surgery": patient.recent_surgery,
        "is_demo_patient": patient.is_demo_patient,
        "encounter": {
            "encounter_id": encounter.id,
            "ward_id": encounter.ward_id,
            "ward_name": ward.name if ward else "Unknown",
            "bed": encounter.bed,
            "admission_time": encounter.admission_time.isoformat(),
            "status": encounter.status,
            "primary_diagnosis": encounter.primary_diagnosis
        } if encounter else None,
        "current_prediction": {
            "current_risk": pred.calibrated_risk_pct,
            "risk_category": pred.risk_category,
            "risk_velocity": pred.risk_velocity_12h,
            "risk_velocity_label": f"{pred.risk_delta_12h:+.1f}% / 12h",
            "rapid_escalation": pred.rapid_escalation,
            "review_priority": pred.review_priority,
            "confidence_level": pred.confidence_level,
            "data_completeness_pct": pred.data_completeness_pct,
            "last_update": pred.timestamp.isoformat()
        } if pred else None,
        "latest_vitals": {
            "heart_rate": latest_vital.heart_rate,
            "temp_c": latest_vital.temp_c,
            "sbp": latest_vital.sbp,
            "dbp": latest_vital.dbp,
            "map": latest_vital.map,
            "resp_rate": latest_vital.resp_rate,
            "spo2": latest_vital.spo2,
            "wbc": latest_vital.wbc,
            "platelets": latest_vital.platelets,
            "creatinine": latest_vital.creatinine,
            "lactate": latest_vital.lactate,
            "cvc_duration_hours": latest_vital.cvc_duration_hours,
            "foley_duration_hours": latest_vital.foley_duration_hours,
            "vent_duration_hours": latest_vital.vent_duration_hours,
            "total_device_burden": latest_vital.total_device_burden,
            "broad_spec_antibiotics_72h": latest_vital.broad_spec_antibiotics_72h
        } if latest_vital else None
    }


@router.get("/{patient_id}/risk", response_model=Dict[str, Any])
def get_patient_risk_trajectory(
    patient_id: str,
    db: Session = Depends(get_db)
):
    """
    Core Dynamic Risk Trajectory Endpoint:
    Calculates sequential longitudinal risk, 6h/12h/24h deltas, velocity, acceleration,
    rapid escalation alerts, and local SHAP feature explanations.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")

    encounter = db.query(Encounter).filter(Encounter.patient_id == patient_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail=f"Encounter for patient {patient_id} not found.")

    # Ingest chronological vitals time-series
    vitals_records_db = (
        db.query(VitalSign)
        .filter(VitalSign.encounter_id == encounter.id)
        .order_by(VitalSign.hour_from_admission.asc())
        .all()
    )
    if not vitals_records_db:
        raise HTTPException(status_code=404, detail=f"No clinical observations found for patient {patient_id}.")

    vitals_payload = [
        {
            "timestamp": v.timestamp.isoformat(),
            "hour_from_admission": v.hour_from_admission,
            "heart_rate": v.heart_rate,
            "temp_c": v.temp_c,
            "sbp": v.sbp,
            "dbp": v.dbp,
            "map": v.map,
            "resp_rate": v.resp_rate,
            "spo2": v.spo2,
            "wbc": v.wbc,
            "platelets": v.platelets,
            "creatinine": v.creatinine,
            "lactate": v.lactate,
            "cvc_duration_hours": v.cvc_duration_hours,
            "foley_duration_hours": v.foley_duration_hours,
            "vent_duration_hours": v.vent_duration_hours,
            "total_device_burden": v.total_device_burden,
            "broad_spec_antibiotics_72h": v.broad_spec_antibiotics_72h
        }
        for v in vitals_records_db
    ]

    patient_meta = {
        "patient_id": patient.id,
        "age": patient.age,
        "gender": patient.gender,
        "charlson_comorbidity_index": patient.charlson_comorbidity_index,
        "recent_surgery": patient.recent_surgery
    }

    trajectory_engine = get_trajectory_engine()
    trajectory_result = trajectory_engine.process_patient_trajectory(patient_meta, vitals_payload)

    return trajectory_result
