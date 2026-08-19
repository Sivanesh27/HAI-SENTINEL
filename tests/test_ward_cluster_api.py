import pytest
from fastapi.testclient import TestClient
from backend.main import app


def test_get_all_wards(client):
    """Test /api/wards returns aggregated ward metrics."""
    response = client.get("/api/wards")
    assert response.status_code == 200
    wards = response.json()
    assert len(wards) >= 3

    icu_a = next((w for w in wards if w["ward_id"] == "ICU-A"), None)
    assert icu_a is not None
    assert "average_risk" in icu_a
    assert "median_risk" in icu_a
    assert "high_risk_count" in icu_a
    assert "rapidly_rising_count" in icu_a
    assert "risk_density" in icu_a
    assert "ward_risk_level" in icu_a
    assert "cluster_signal" in icu_a


def test_get_ward_detail(client):
    """Test /api/wards/{id} returns spatial bed layout and roster."""
    response = client.get("/api/wards/ICU-A")
    assert response.status_code == 200
    data = response.json()

    assert data["ward_id"] == "ICU-A"
    assert "bed_layout" in data
    assert len(data["bed_layout"]) == data["bed_count"]
    assert "patient_roster" in data
    assert len(data["patient_roster"]) > 0


def test_get_active_clusters_guardrails(client):
    """Verify cluster endpoint returns 'Potential cluster requiring IPC review' and avoids 'outbreak'."""
    response = client.get("/api/clusters")
    assert response.status_code == 200
    clusters = response.json()

    # Verify terminology guardrails
    for c in clusters:
        assert c["cluster_message"] == "Potential cluster requiring IPC review."
        assert "outbreak" not in c["cluster_message"].lower()
        assert "scientific_disclaimer" in c
        assert "contributing_patients" in c
