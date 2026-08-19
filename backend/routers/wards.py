import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.database import get_db
from backend.models import Ward, Patient, Encounter, RiskPrediction
from backend.services.cluster_detector import get_cluster_detector

router = APIRouter(tags=["Ward Intelligence & Cluster Radar"])


def _fetch_ward_patient_summaries(db: Session, ward_id: str) -> List[Dict[str, Any]]:
    """Helper to retrieve active patient predictions within a specific ward."""
    results = (
        db.query(Patient, Encounter, RiskPrediction)
        .join(Encounter, Patient.id == Encounter.patient_id)
        .join(RiskPrediction, Encounter.id == RiskPrediction.encounter_id)
        .filter(Encounter.ward_id == ward_id)
        .all()
    )

    patient_summaries = []
    for p, enc, pred in results:
        top_pos = json.loads(pred.top_positive_drivers_json) if pred.top_positive_drivers_json else []
        drivers = [d.get("display_name", d.get("feature_name")) for d in top_pos[:2]]

        patient_summaries.append({
            "patient_id": p.id,
            "mrn": p.mrn,
            "bed": enc.bed,
            "age": p.age,
            "gender": p.gender,
            "current_risk": pred.calibrated_risk_pct,
            "risk_category": pred.risk_category,
            "risk_velocity": pred.risk_velocity_12h,
            "risk_velocity_label": f"{pred.risk_delta_12h:+.1f}% / 12h",
            "rapid_escalation": pred.rapid_escalation,
            "review_priority": pred.review_priority,
            "confidence_level": pred.confidence_level,
            "primary_drivers": drivers,
            "is_demo_patient": p.is_demo_patient
        })

    return patient_summaries


@router.get("/api/wards", response_model=List[Dict[str, Any]])
def get_all_wards(db: Session = Depends(get_db)):
    """
    Returns aggregated hospital ward risk intelligence, density metrics,
    and emerging cluster signals.
    """
    wards = db.query(Ward).all()
    detector = get_cluster_detector()
    ward_results = []

    for w in wards:
        patients = _fetch_ward_patient_summaries(db, w.id)
        analysis = detector.analyze_ward(
            ward_id=w.id,
            ward_name=w.name,
            unit_type=w.unit_type,
            bed_count=w.bed_count,
            patients=patients
        )
        ward_results.append(analysis)

    return ward_results


@router.get("/api/wards/{ward_id}", response_model=Dict[str, Any])
def get_ward_detail(ward_id: str, db: Session = Depends(get_db)):
    """
    Returns deep-dive spatial bed layout and patient trajectories for a specific ward.
    """
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward {ward_id} not found.")

    patients = _fetch_ward_patient_summaries(db, ward.id)
    detector = get_cluster_detector()
    analysis = detector.analyze_ward(
        ward_id=ward.id,
        ward_name=ward.name,
        unit_type=ward.unit_type,
        bed_count=ward.bed_count,
        patients=patients
    )

    # Construct complete bed layout (including empty beds)
    bed_layout = []
    assigned_beds = {p["bed"]: p for p in patients}
    for bed_num in range(1, ward.bed_count + 1):
        bed_code = f"{ward.id}-{bed_num:02d}"
        if bed_code in assigned_beds:
            p = assigned_beds[bed_code]
            bed_layout.append({
                "bed": bed_code,
                "occupied": True,
                "patient_id": p["patient_id"],
                "current_risk": p["current_risk"],
                "risk_category": p["risk_category"],
                "risk_velocity_label": p["risk_velocity_label"],
                "rapid_escalation": p["rapid_escalation"],
                "review_priority": p["review_priority"]
            })
        else:
            bed_layout.append({
                "bed": bed_code,
                "occupied": False,
                "patient_id": None,
                "current_risk": 0.0,
                "risk_category": "EMPTY",
                "risk_velocity_label": "N/A",
                "rapid_escalation": False,
                "review_priority": None
            })

    analysis["bed_layout"] = bed_layout
    analysis["patient_roster"] = patients
    return analysis


@router.get("/api/clusters", response_model=List[Dict[str, Any]])
def get_active_clusters(db: Session = Depends(get_db)):
    """
    Returns active spatial-temporal risk clusters across all hospital units
    designated strictly as: 'Potential cluster requiring IPC review.'
    """
    wards = db.query(Ward).all()
    detector = get_cluster_detector()
    active_clusters = []

    for w in wards:
        patients = _fetch_ward_patient_summaries(db, w.id)
        analysis = detector.analyze_ward(
            ward_id=w.id,
            ward_name=w.name,
            unit_type=w.unit_type,
            bed_count=w.bed_count,
            patients=patients
        )
        if analysis["cluster_signal"]:
            active_clusters.append({
                "ward_id": analysis["ward_id"],
                "ward_name": analysis["ward_name"],
                "unit_type": analysis["unit_type"],
                "ward_risk_level": analysis["ward_risk_level"],
                "high_risk_count": analysis["high_risk_count"],
                "critical_risk_count": analysis["critical_risk_count"],
                "rapidly_rising_count": analysis["rapidly_rising_count"],
                "risk_density": analysis["risk_density"],
                "cluster_signal": True,
                "cluster_message": "Potential cluster requiring IPC review.",
                "review_recommendation": analysis["review_recommendation"],
                "contributing_patients": analysis["contributing_patients"],
                "timestamp": datetime.utcnow().isoformat(),
                "scientific_disclaimer": analysis["scientific_disclaimer"]
            })

    return active_clusters
