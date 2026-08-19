import pytest
from fastapi.testclient import TestClient
from backend.main import app


def test_executive_dashboard_endpoint(client):
    """Test /api/dashboard returns KPIs, risk distribution, and escalations."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert "kpis" in data
    assert "total_monitored_patients" in data["kpis"]
    assert "critical_risk_count" in data["kpis"]
    assert "active_clusters_count" in data["kpis"]
    assert "risk_distribution" in data
    assert "wards_overview" in data
    assert "recent_escalations" in data


def test_data_quality_endpoint(client):
    """Test /api/data-quality returns completeness and telemetry freshness."""
    response = client.get("/api/data-quality")
    assert response.status_code == 200
    data = response.json()

    assert "overall_completeness_pct" in data
    assert "vitals_completeness_pct" in data
    assert "laboratory_completeness_pct" in data
    assert data["missingness_penalty_active"] is True


def test_model_performance_and_comparison(client):
    """Test /api/model/performance and /api/model/comparison return evaluation curves and models."""
    res_perf = client.get("/api/model/performance")
    assert res_perf.status_code == 200
    perf = res_perf.json()
    assert "metrics" in perf
    assert "roc_curve" in perf
    assert "pr_curve" in perf
    assert "calibration" in perf

    res_comp = client.get("/api/model/comparison")
    assert res_comp.status_code == 200
    comp = res_comp.json()
    assert len(comp) >= 3


def test_scenario_simulator_endpoint(client):
    """Test POST /api/model/scenario executes what-if simulation."""
    payload = {
        "patient_id": "DEMO-1042",
        "base_features": {
            "age": 69,
            "gender_male": 1,
            "hour_from_admission": 60,
            "cvc_duration_hours": 48.0,
            "temp_c_last": 38.5,
            "wbc_last": 18.0
        },
        "perturbed_features": {
            "cvc_duration_hours": 0.0,
            "temp_c_last": 37.0,
            "wbc_last": 7.5
        }
    }
    response = client.post("/api/model/scenario", json=payload)
    assert response.status_code == 200
    sim = response.json()

    assert "baseline_risk_pct" in sim
    assert "simulated_risk_pct" in sim
    assert "delta_risk_pct" in sim
    assert "scientific_disclaimer" in sim
    assert "NOT A CAUSAL CLINICAL PREDICTION" in sim["scientific_disclaimer"]


def test_audit_logs_endpoint(client):
    """Test GET and POST /api/audit."""
    get_res = client.get("/api/audit")
    assert get_res.status_code == 200
    logs = get_res.json()
    assert "logs" in logs
    assert len(logs["logs"]) > 0

    post_payload = {
        "user_id": "JUDGE_HACKATHON_DEMO",
        "user_role": "RESEARCHER",
        "action": "INTERACTIVE_TOUR_REVIEW",
        "patient_id": "DEMO-1042",
        "details": {"score": 82.0, "step": "Trajectory verified"}
    }
    post_res = client.post("/api/audit", json=post_payload)
    assert post_res.status_code == 200
    assert post_res.json()["status"] == "success"


def test_demo_scenario_endpoint(client):
    """Test /api/demo/scenario returns all 6 deterministic stages and ICU-A cluster."""
    response = client.get("/api/demo/scenario")
    assert response.status_code == 200
    data = response.json()

    assert "stages" in data
    assert len(data["stages"]) == 6
    assert data["offline_ready"] is True
    assert data["stages"][0]["patient"]["current_risk"] == 17.0
    assert data["stages"][4]["patient"]["current_risk"] == 82.0
    assert data["stages"][4]["ward_status"]["cluster_signal"] is True
    assert data["stages"][4]["ward_status"]["cluster_message"] == "Potential cluster requiring IPC review."
