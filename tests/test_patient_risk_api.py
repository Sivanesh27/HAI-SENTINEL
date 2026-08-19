import pytest
from fastapi.testclient import TestClient
from backend.main import app


def test_get_patients_list(client):
    """Test /api/patients returns list of patients with risk velocity and priority badges."""
    response = client.get("/api/patients?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "patients" in data
    assert len(data["patients"]) > 0

    first_patient = data["patients"][0]
    assert "patient_id" in first_patient
    assert "current_risk" in first_patient
    assert "risk_category" in first_patient
    assert "risk_velocity" in first_patient
    assert "review_priority" in first_patient


def test_get_patient_detail(client):
    """Test /api/patients/{id} returns demographics and latest vitals."""
    response = client.get("/api/patients/DEMO-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "DEMO-1042"
    assert "encounter" in data
    assert "latest_vitals" in data


def test_get_patient_risk_trajectory(client):
    """Test /api/patients/{id}/risk returns dynamic trajectory and local SHAP attributions."""
    response = client.get("/api/patients/DEMO-1042/risk")
    assert response.status_code == 200
    data = response.json()

    assert data["patient_id"] == "DEMO-1042"
    assert "current_risk" in data
    assert "risk_category" in data
    assert "confidence" in data
    assert "risk_delta_6h" in data
    assert "risk_delta_12h" in data
    assert "risk_delta_24h" in data
    assert "risk_velocity" in data
    assert "risk_velocity_label" in data
    assert "risk_acceleration" in data
    assert "rapid_escalation" in data
    assert "review_priority" in data
    assert "trajectory" in data
    assert len(data["trajectory"]) > 1

    # Verify non-causal trajectory summary
    assert "trajectory_summary" in data
    assert "percentage points" in data["trajectory_summary"] or "stable" in data["trajectory_summary"]

    # Verify SHAP attributions
    assert "top_features" in data
    assert "top_positive_drivers" in data["top_features"]
    assert "top_negative_drivers" in data["top_features"]
    assert "scientific_disclaimer" in data
