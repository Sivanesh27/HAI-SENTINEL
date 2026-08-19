# HAI-Sentinel System Architecture

---

## 1. High-Level Modular Design

```
+----------------------------------------------------------------------------------------------------+
|                                    HAI-SENTINEL MODULAR STACK                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ FRONTEND - React + TypeScript + Vite + TailwindCSS + Recharts ]                                 |
|  - Executive Dashboard (KPI metrics, risk distribution, rapid escalations)                         |
|  - Patient Monitor (Sortable patient table with velocity badges & sparklines)                       |
|  - Patient Detail (Longitudinal trajectory, SHAP waterfall, dynamic vitals stream)                 |
|  - Ward Intelligence (Hospital spatial overview, risk density, bed status)                         |
|  - Cluster Detection (Emerging multi-patient localized infection signals)                          |
|  - Model Performance (AUROC, AUPRC, Isotonic Calibration, Brier score)                             |
|  - What-If Simulator (Interactive non-causal scenario perturbation)                               |
|  - Deterministic 90s Hackathon Demo Mode                                                           |
|                                                                                                    |
|                                     │ REST / JSON (HTTP)                                           |
|                                     ▼                                                              |
|                                                                                                    |
|  [ BACKEND - FastAPI + Pydantic v2 + SQLAlchemy 2.0 ORM ]                                          |
|  - Auth & RBAC (IPC_ADMIN, CLINICIAN, RESEARCHER, VIEWER)                                          |
|  - Temporal Risk Engine (Dynamic trajectory, velocity, acceleration calculus)                      |
|  - Ward Cluster Engine (Spatial-temporal anomaly detection)                                        |
|  - Audit & Compliance Logging (Immutable prediction ledger & model versioning)                     |
|                                                                                                    |
|                                     │ In-Memory / Python                                           |
|                                     ▼                                                              |
|                                                                                                    |
|  [ ML ENGINE - scikit-learn + XGBoost + LightGBM + Tree-SHAP + Isotonic Calibration ]             |
|  - Temporal Feature Extractor (Slopes, deltas, rolling windows, device hours)                      |
|  - Multi-Model Inference (XGBoost, Random Forest, Logistic Regression)                             |
|  - Local SHAP Attribution Generator                                                                |
|  - Data Quality & Uncertainty Penalty Estimator                                                    |
|                                                                                                    |
|                                     │ SQLAlchemy ORM                                               |
|                                     ▼                                                              |
|                                                                                                    |
|  [ DATABASE LAYER - PostgreSQL 15 / SQLite Development Engine ]                                     |
|  - wards, patients, encounters, vitals, labs, devices, medications, predictions, alerts, audit_logs |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. API Endpoints Contract

- `GET /api/health` — System status, database health, disclaimer
- `GET /api/dashboard` — Executive summary statistics and high-risk alerts
- `GET /api/patients` — Paginated, sortable patient list with risk velocities
- `GET /api/patients/{id}` — Individual patient longitudinal trajectory and vitals
- `GET /api/patients/{id}/explanation` — Local SHAP feature contributions
- `GET /api/wards` — Hospital ward risk aggregation and bed status
- `GET /api/clusters` — Spatial-temporal cluster signals requiring IPC review
- `GET /api/model/performance` — ROC, PR, Calibration, and Confusion Matrix metrics
- `POST /api/scenario` — Non-causal what-if parameter simulation
- `GET /api/data-quality` — Missingness rates and completeness statistics
- `POST /api/demo/run-scenario` — Deterministic 90-second judge demonstration state progression
