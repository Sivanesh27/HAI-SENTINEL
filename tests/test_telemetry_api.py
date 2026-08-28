import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_telemetry_ingest_endpoint():
    payload = {
        "patient_id": "DEMO-1042",
        "temp_c": 38.8,
        "heart_rate": 118,
        "resp_rate": 26,
        "map": 60,
        "spo2": 92,
        "wbc": 19.5,
        "lactate": 3.1,
        "platelets": 88,
        "cvc_duration_hours": 66,
        "foley_duration_hours": 72,
        "vent_duration_hours": 0
    }
    response = client.post("/api/telemetry/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["patient_id"] == "DEMO-1042"
    assert data["calibrated_risk"] > 50.0
    assert "risk_category" in data
    assert "risk_velocity" in data
    assert "audit_id" in data

def test_telemetry_triage_calculator_endpoint():
    payload = {
        "age": 68,
        "gender": "Male",
        "charlson_index": 3,
        "temp_c": 38.6,
        "heart_rate": 112,
        "resp_rate": 24,
        "map": 64,
        "spo2": 93,
        "wbc": 18.2,
        "lactate": 2.8,
        "platelets": 92,
        "cvc_dwell_hours": 60,
        "foley_dwell_hours": 72,
        "vent_dwell_hours": 0
    }
    response = client.post("/api/telemetry/triage-calculator", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["calibrated_risk_pct"] >= 0.0 and data["calibrated_risk_pct"] <= 100.0
    assert data["risk_category"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "top_positive_drivers" in data
    assert "inference_latency_ms" in data
    assert data["inference_latency_ms"] < 50.0

def test_telemetry_live_feed_endpoint():
    response = client.get("/api/telemetry/live-feed")
    assert response.status_code == 200
    data = response.json()
    assert "live_telemetry" in data
    assert data["active_stream_beds"] >= 1
    assert len(data["live_telemetry"]) >= 1
