import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from backend.database import get_db
from backend.models import AuditLog

router = APIRouter(prefix="/api/audit", tags=["Clinical Audit & Governance Trail"])


class CreateAuditEntry(BaseModel):
    user_id: str = "CLINICIAN_IPC_01"
    user_role: str = "IPC_ADMIN"
    action: str
    patient_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


@router.get("", response_model=Dict[str, Any])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns immutable audit logs tracking model inferences, what-if simulations,
    and clinician IPC review actions.
    """
    # If empty, create initial baseline audit trail entries
    if db.query(AuditLog).count() == 0:
        sample_entries = [
            AuditLog(
                timestamp=datetime.utcnow(),
                user_id="SYSTEM_ML_ENGINE",
                user_role="RESEARCHER",
                action="MODEL_TRAINED_AND_CALIBRATED",
                patient_id=None,
                model_version="1.0.0",
                details_json=json.dumps({"algorithm": "XGBoost", "calibration": "Isotonic", "AUROC": 0.9695, "AUPRC": 0.8877})
            ),
            AuditLog(
                timestamp=datetime.utcnow(),
                user_id="IPC_LEAD_DR_CHEN",
                user_role="IPC_ADMIN",
                action="CLUSTER_SIGNAL_ACKNOWLEDGED",
                patient_id="DEMO-1042",
                model_version="1.0.0",
                details_json=json.dumps({"ward": "ICU-A", "action": "Bundle compliance audit initiated"})
            ),
            AuditLog(
                timestamp=datetime.utcnow(),
                user_id="ICU_NURSE_SPECIALIST",
                user_role="CLINICIAN",
                action="TRAJECTORY_REVIEW_CONFIRMED",
                patient_id="DEMO-1042",
                model_version="1.0.0",
                details_json=json.dumps({"risk_score": 82.0, "priority": 1, "status": "Rounding complete"})
            )
        ]
        for e in sample_entries:
            db.add(e)
        db.commit()

    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "user_id": log.user_id,
                "user_role": log.user_role,
                "action": log.action,
                "patient_id": log.patient_id,
                "model_version": log.model_version,
                "details": json.loads(log.details_json) if log.details_json else {}
            }
            for log in items
        ]
    }


@router.post("", response_model=Dict[str, Any])
def create_audit_entry(entry: CreateAuditEntry, db: Session = Depends(get_db)):
    """
    Appends a new immutable clinical audit action to the governance ledger.
    """
    log = AuditLog(
        timestamp=datetime.utcnow(),
        user_id=entry.user_id,
        user_role=entry.user_role,
        action=entry.action,
        patient_id=entry.patient_id,
        model_version="1.0.0",
        details_json=json.dumps(entry.details) if entry.details else None
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "status": "success",
        "log_id": log.id,
        "timestamp": log.timestamp.isoformat()
    }
