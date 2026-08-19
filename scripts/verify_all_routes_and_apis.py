import urllib.request
import json
import sys


def test_endpoint(url: str, method: str = "GET", payload: dict = None) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8") if payload else None,
        headers={"Content-Type": "application/json"} if payload else {}
    )
    req.get_method = lambda: method
    with urllib.request.urlopen(req, timeout=10) as response:
        status = response.status
        body = response.read().decode("utf-8")
        return {"status": status, "data": json.loads(body) if body else {}}


def run_full_pre_submission_verification():
    print("================================================================")
    print("HAI-SENTINEL: COMPREHENSIVE PRE-SUBMISSION VERIFICATION PROTOCOL")
    print("================================================================")
    
    results = {}

    # 1. System Health
    try:
        res = test_endpoint("http://127.0.0.1:8000/api/health")
        assert res["status"] == 200 and res["data"]["status"] == "online"
        results["Health Check & System Status"] = "PASS"
    except Exception as e:
        results["Health Check & System Status"] = f"FAIL ({e})"

    # 2. Executive Dashboard (Module 1)
    try:
        res = test_endpoint("http://127.0.0.1:8000/api/dashboard")
        assert res["status"] == 200
        kpis = res["data"]["kpis"]
        assert kpis["total_monitored_patients"] == 250
        assert kpis["critical_risk_count"] > 0
        assert len(res["data"]["wards_overview"]) >= 4
        results["Executive Command Dashboard (/api/dashboard)"] = "PASS"
    except Exception as e:
        results["Executive Command Dashboard (/api/dashboard)"] = f"FAIL ({e})"

    # 3. Patient List & Risk Prioritization (Module 2)
    try:
        res = test_endpoint("http://127.0.0.1:8000/api/patients?limit=50")
        assert res["status"] == 200
        patients = res["data"]["patients"]
        assert len(patients) == 50
        assert any(p["patient_id"] == "DEMO-1042" for p in patients)
        results["Patient Risk Surveillance Monitor (/api/patients)"] = "PASS"
    except Exception as e:
        results["Patient Risk Surveillance Monitor (/api/patients)"] = f"FAIL ({e})"

    # 4. Patient Detail & Dynamic Trajectory Engine (Modules 3, 4, 8)
    try:
        res_detail = test_endpoint("http://127.0.0.1:8000/api/patients/DEMO-1042")
        res_risk = test_endpoint("http://127.0.0.1:8000/api/patients/DEMO-1042/risk")
        assert res_detail["status"] == 200
        assert res_risk["status"] == 200
        assert res_risk["data"]["current_risk"] >= 80.0
        assert len(res_risk["data"]["trajectory"]) >= 5
        assert res_risk["data"]["top_features"] is not None
        results["Dynamic Risk Trajectory & SHAP Explainability (/api/patients/DEMO-1042/risk)"] = "PASS"
    except Exception as e:
        results["Dynamic Risk Trajectory & SHAP Explainability (/api/patients/DEMO-1042/risk)"] = f"FAIL ({e})"

    # 5. Ward Intelligence & Spatial Bed Radar (Module 5)
    try:
        res_wards = test_endpoint("http://127.0.0.1:8000/api/wards")
        res_icu_a = test_endpoint("http://127.0.0.1:8000/api/wards/ICU-A")
        assert res_wards["status"] == 200
        assert res_icu_a["status"] == 200
        assert len(res_icu_a["data"]["bed_layout"]) == 24
        results["Ward Intelligence & Spatial Bed Matrix (/api/wards)"] = "PASS"
    except Exception as e:
        results["Ward Intelligence & Spatial Bed Matrix (/api/wards)"] = f"FAIL ({e})"

    # 6. Cluster Anomaly Surveillance Radar (Module 6)
    try:
        res_clusters = test_endpoint("http://127.0.0.1:8000/api/clusters")
        assert res_clusters["status"] == 200
        clusters = res_clusters["data"]
        assert len(clusters) > 0
        assert clusters[0]["cluster_message"] == "Potential cluster requiring IPC review."
        assert "outbreak" not in clusters[0]["cluster_message"].lower()
        results["Cluster Anomaly Radar (/api/clusters)"] = "PASS"
    except Exception as e:
        results["Cluster Anomaly Radar (/api/clusters)"] = f"FAIL ({e})"

    # 7. Model Performance & Calibration Evaluation (Modules 10, 11)
    try:
        res_perf = test_endpoint("http://127.0.0.1:8000/api/model/performance")
        res_comp = test_endpoint("http://127.0.0.1:8000/api/model/comparison")
        assert res_perf["status"] == 200
        assert res_comp["status"] == 200
        metrics = res_perf["data"]["metrics"]
        assert metrics["auroc"] > 0.95
        assert metrics["auprc"] > 0.85
        assert res_perf["data"]["calibration"]["expected_calibration_error"] < 0.05
        results["Model Performance, AUROC/AUPRC & Calibration (/api/model/performance)"] = "PASS"
    except Exception as e:
        results["Model Performance, AUROC/AUPRC & Calibration (/api/model/performance)"] = f"FAIL ({e})"

    # 8. What-If Counterfactual Scenario Simulator (Module 9)
    try:
        payload = {
            "patient_id": "DEMO-1042",
            "base_features": {
                "age": 69, "gender_male": 1, "hour_from_admission": 60,
                "cvc_duration_hours": 60.0, "temp_c_last": 38.6, "wbc_last": 18.4
            },
            "perturbed_features": {
                "cvc_duration_hours": 0.0, "temp_c_last": 37.0, "wbc_last": 7.5
            }
        }
        res_sim = test_endpoint("http://127.0.0.1:8000/api/model/scenario", method="POST", payload=payload)
        assert res_sim["status"] == 200
        sim = res_sim["data"]
        assert "scientific_disclaimer" in sim
        results["What-If Counterfactual Simulator (/api/model/scenario)"] = "PASS"
    except Exception as e:
        results["What-If Counterfactual Simulator (/api/model/scenario)"] = f"FAIL ({e})"

    # 9. Clinical Audit Trail & Governance (Modules 18, 20)
    try:
        res_audit = test_endpoint("http://127.0.0.1:8000/api/audit")
        assert res_audit["status"] == 200
        assert len(res_audit["data"]["logs"]) > 0
        results["Clinical Audit Trail & Governance Ledger (/api/audit)"] = "PASS"
    except Exception as e:
        results["Clinical Audit Trail & Governance Ledger (/api/audit)"] = f"FAIL ({e})"

    # 10. Deterministic Hackathon Demo Scenario (Modules 15, 16)
    try:
        res_demo = test_endpoint("http://127.0.0.1:8000/api/demo/scenario")
        assert res_demo["status"] == 200
        stages = res_demo["data"]["stages"]
        assert len(stages) == 6
        assert stages[0]["patient"]["current_risk"] == 17.0
        assert stages[4]["patient"]["current_risk"] == 82.0
        assert stages[4]["ward_status"]["cluster_signal"] is True
        assert stages[5]["priority_rounding_roster"] is not None
        results["90-Second Deterministic Hackathon Demo Scenario (/api/demo/scenario)"] = "PASS"
    except Exception as e:
        results["90-Second Deterministic Hackathon Demo Scenario (/api/demo/scenario)"] = f"FAIL ({e})"

    # 11. Frontend Production Application Server (http://127.0.0.1:5173)
    try:
        req = urllib.request.Request("http://127.0.0.1:5173")
        with urllib.request.urlopen(req, timeout=5) as response:
            assert response.status == 200
            html = response.read().decode("utf-8")
            assert "HAI-Sentinel" in html or "<div id=\"root\">" in html
            results["Frontend Application Bundle & Root HTML (http://127.0.0.1:5173)"] = "PASS"
    except Exception as e:
        results["Frontend Application Bundle & Root HTML (http://127.0.0.1:5173)"] = f"FAIL ({e})"

    print("\n---------------------- SUMMARY RESULTS ----------------------")
    all_pass = True
    for test_name, status in results.items():
        print(f"[{status}] {test_name}")
        if "FAIL" in status:
            all_pass = False

    print("-------------------------------------------------------------")
    if all_pass:
        print("ALL VERIFICATION CHECKS PASSED: 100% READY FOR SUBMISSION!")
    else:
        print("SOME CHECKS FAILED - REVIEW REQUIRED")
    return all_pass


if __name__ == "__main__":
    success = run_full_pre_submission_verification()
    sys.exit(0 if success else 1)
