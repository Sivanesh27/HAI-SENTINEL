from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    unit_type = Column(String, nullable=False)  # MICU, SICU, CCU, Stepdown
    bed_count = Column(Integer, default=24)
    risk_status = Column(String, default="LOW")  # LOW, MODERATE, HIGH, CRITICAL

    encounters = relationship("Encounter", back_populates="ward")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    charlson_comorbidity_index = Column(Integer, default=0)
    recent_surgery = Column(Boolean, default=False)
    is_demo_patient = Column(Boolean, default=False)

    encounters = relationship("Encounter", back_populates="patient")


class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    ward_id = Column(String, ForeignKey("wards.id"), nullable=False)
    bed = Column(String, nullable=False)
    admission_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ACTIVE")  # ACTIVE, DISCHARGED
    primary_diagnosis = Column(String, default="Acute Critical Care")

    patient = relationship("Patient", back_populates="encounters")
    ward = relationship("Ward", back_populates="encounters")
    vitals = relationship("VitalSign", back_populates="encounter")
    predictions = relationship("RiskPrediction", back_populates="encounter")


class VitalSign(Base):
    __tablename__ = "vital_signs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    encounter_id = Column(String, ForeignKey("encounters.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    hour_from_admission = Column(Integer, nullable=False)
    heart_rate = Column(Float, nullable=False)
    temp_c = Column(Float, nullable=False)
    sbp = Column(Float, nullable=False)
    dbp = Column(Float, nullable=False)
    map = Column(Float, nullable=False)
    resp_rate = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    wbc = Column(Float, nullable=False)
    platelets = Column(Float, nullable=False)
    creatinine = Column(Float, nullable=False)
    lactate = Column(Float, nullable=False)
    cvc_duration_hours = Column(Float, default=0.0)
    foley_duration_hours = Column(Float, default=0.0)
    vent_duration_hours = Column(Float, default=0.0)
    total_device_burden = Column(Integer, default=0)
    broad_spec_antibiotics_72h = Column(Integer, default=0)

    encounter = relationship("Encounter", back_populates="vitals")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    encounter_id = Column(String, ForeignKey("encounters.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    hour_from_admission = Column(Integer, nullable=False)
    model_version = Column(String, default="1.0.0")
    calibrated_risk_pct = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    risk_delta_6h = Column(Float, default=0.0)
    risk_delta_12h = Column(Float, default=0.0)
    risk_delta_24h = Column(Float, default=0.0)
    risk_velocity_12h = Column(Float, default=0.0)
    risk_acceleration_12h = Column(Float, default=0.0)
    rapid_escalation = Column(Boolean, default=False)
    confidence_level = Column(String, default="HIGH")
    data_completeness_pct = Column(Float, default=100.0)
    review_priority = Column(Integer, default=3)  # 1 (Highest), 2, 3
    top_positive_drivers_json = Column(Text, nullable=True)
    top_negative_drivers_json = Column(Text, nullable=True)

    encounter = relationship("Encounter", back_populates="predictions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, default="IPC_USER_DEMO")
    user_role = Column(String, default="IPC_ADMIN")  # IPC_ADMIN, CLINICIAN, RESEARCHER, VIEWER
    action = Column(String, nullable=False)  # PREDICTION_INFERENCE, SCENARIO_SIMULATION, BUNDLE_AUDIT, CLUSTER_REVIEW
    patient_id = Column(String, nullable=True)
    model_version = Column(String, default="1.0.0")
    details_json = Column(Text, nullable=True)

