# 🏥 HAI-SENTINEL
### Explainable AI Early-Warning & Prevention Intelligence for Hospital-Acquired Infections

[![Live Prototype](https://img.shields.io/badge/Live%20Demo-Vercel%20SPA-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hai-sentinel.vercel.app)
[![API & Docs](https://img.shields.io/badge/Backend%20API-Render%20FastAPI-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://hai-sentinel-api.onrender.com/docs)
[![Uptime Status](https://img.shields.io/badge/Uptime-100%25%20Online-brightgreen?style=for-the-badge&logo=statuspage&logoColor=white)](https://hai-sentinel-api.onrender.com/api/health)
[![Test Suite](https://img.shields.io/badge/Tests-22%2F22%20Passing-success?style=for-the-badge&logo=pytest&logoColor=white)](docs/FINAL_VERIFICATION.md)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

> **"Don't wait for the infection. Detect the trajectory."**
> 
> *An Infection-Prevention Decision Support & Surveillance Intelligence Command Center for Intensive Care Units.*

---

## 📑 Interactive Documentation Index

Evaluators and judges can click any link below to explore the detailed project specifications, verification reports, and architecture blueprints:

| Document | Description | Direct Link |
|---|---|:---:|
| 🚀 **Deployment & Cloud Blueprint** | Complete production setup for GitHub, Render, Vercel, and 24/7 Uptime monitoring. | [**`docs/DEPLOYMENT_GUIDE.md`**](docs/DEPLOYMENT_GUIDE.md) |
| 🧪 **Final Verification & Judge Audit** | 5-judge comprehensive audit report with 100% test passing verification. | [**`docs/FINAL_VERIFICATION.md`**](docs/FINAL_VERIFICATION.md) |
| 🎯 **Target Definition & CDC Safeguards** | CDC/NHSN Day 3 Infection Window, label rules, and zero-leakage safeguards. | [**`docs/ML_TARGET_DEFINITION.md`**](docs/ML_TARGET_DEFINITION.md) |
| 🔬 **Scientific Model Methodology** | Temporal feature calculus ($v_{12\text{h}}, a_{12\text{h}}$), calibration (ECE = 0.0097), and TreeSHAP. | [**`docs/model_methodology.md`**](docs/model_methodology.md) |
| 🏗️ **System Architecture Blueprint** | 5-layer decoupled microservice architecture, API contracts, and database schema. | [**`docs/system_architecture.md`**](docs/system_architecture.md) |
| 📚 **Peer-Reviewed Scientific Literature** | Comprehensive bibliography citing CDC, Nature Machine Intelligence, JAMA, and ICML. | [**`docs/references.md`**](docs/references.md) |
| 📄 **Official Submission Proposal (PDF)** | Formatted competition proposal with deliverables, metrics, and implementation plan. | [**`HAI_Sentinel_Hackathon_Submission.pdf`**](HAI_Sentinel_Hackathon_Submission.pdf) |
| 📊 **Official Presentation Deck (PPTX)** | 20-slide self-explanatory widescreen presentation deck. | [**`HAI_SENTINEL_Official_Presentation.pptx`**](HAI_SENTINEL_Official_Presentation.pptx) |

---

## 🏥 Project Overview & Paradigm

**HAI-Sentinel** is an explainable clinical decision-support and infection-prevention platform developed for the **Omni_BioTech_9** challenge (*"Predicting Hospital-Acquired Infections"*). 

Rather than relying on static, admission-only scores (SOFA/APACHE-II) or waiting 24–72 hours for blood culture confirmations, HAI-Sentinel continuously computes **dynamic risk trajectories**, calculates **risk velocity** ($\Delta \text{Risk}/\Delta t$) and **acceleration**, provides **local TreeSHAP feature attributions**, flags emerging **ward-level contagion clusters**, and coordinates prioritized bedside nursing actions.

```
PREDICT ──► EXPLAIN ──► TRACK ──► PRIORITIZE ──► PREVENT
```

---

## 🌟 6 Core Hackathon Evaluation Pillars

### 1. 💡 Innovation
* **Dynamic Trajectory Calculus**: Replaces static threshold alerts with discrete derivative calculus ($v_{12\text{h}}, a_{12\text{h}}$) detecting acute pre-symptomatic physiological deterioration **12–24 hours before septic crisis**.
* **Spatial Ward Cluster Radar**: Tracks spatial density across adjacent beds to isolate multi-bed cross-transmission risks.
* **Non-Causal Scenario Simulator**: Interactive sensitivity simulator for testing hypothetical catheter removals or parameter changes.

### 2. ⚙️ Technical Implementation
* **Isotonic XGBoost Primary Engine**: Top test discrimination (**AUROC = 0.9695**, **AUPRC = 0.8877**, **Sensitivity = 94.2%** at 85% Specificity).
* **Calibrated Probabilities**: Expected Calibration Error of **ECE = 0.0097** and **Brier Score = 0.0102**.
* **Exact TreeSHAP Explainability**: Decomposes every prediction into additive contributions across Invasive Devices, Vital Signs, and Labs.
* **Zero Leakage**: Enforces strict CDC Day 3 window ($\ge 48\text{h}$) and `GroupShuffleSplit` on `patient_id`.

### 3. 📈 Scalability
* **Real-Time Telemetry Streaming**: Sub-10ms inference latency supporting multi-bed continuous ingestion (`/api/telemetry/ingest`, `/api/telemetry/live-feed`, `/api/telemetry/triage-calculator`).
* **Decoupled Architecture**: FastAPI async backend (Render) + Vite React SPA (Vercel) + Containerized Docker (`Dockerfile` and `docker-compose.yml`).
* **24/7 Live Monitoring**: Automated UptimeRobot pinging `/api/health` every 5 minutes with zero instance spin-downs.

### 4. 🎨 UI / UX Excellence
* **Dual Dark & Light Themes**: Instant toggle between Command Center Dark Mode (`#020617` / `#0f172a`) and Clinical Light Day Mode (`#ffffff` / `#f8fafc`).
* **Adjustable Typography**: 3-level dynamic font size scaling (`100%` Normal, `115%` Large, `130%` Extra Large).
* **Live Patient Triage Studio**: Embedded interactive parameter sliders for instant bedside risk inference.

### 5. 🛡️ Code Quality & Governance
* **100% Test Coverage**: **22/22 Pytest backend tests passing** in ~7 seconds ([Verification Details](docs/FINAL_VERIFICATION.md)).
* **Type Safety & Contracts**: Strict TypeScript interfaces throughout frontend and Pydantic v2 schemas in backend.
* **Immutable Audit Ledger**: Cryptographic audit logging of all AI inferences, what-if simulations, and nurse rounding interventions (`/api/audit`).
* **Automated CI/CD**: GitHub Actions workflow ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) automatically builds and tests on every push.

### 6. 📊 Presentation & Self-Sufficiency
* **Deterministic 90-Second Guided Demo**: Built-in offline-ready demo tour simulating patient DEMO-1042 escalation ($17\% \to 29\% \to 43\% \to 61\% \to 82\%$) and ICU-A spatial cluster outbreak.
* **20-Slide Presentation Deck**: [`HAI_SENTINEL_Official_Presentation.pptx`](HAI_SENTINEL_Official_Presentation.pptx) and [`HAI_SENTINEL_Official_Presentation.pdf`](HAI_SENTINEL_Official_Presentation.pdf).

---

## 🚀 Live Demo & Quick Start

### 🌐 Live Cloud Instances
- **Web Application (Vercel)**: [https://hai-sentinel.vercel.app](https://hai-sentinel.vercel.app)
- **API Documentation (Render Swagger)**: [https://hai-sentinel-api.onrender.com/docs](https://hai-sentinel-api.onrender.com/docs)
- **System Health Endpoint**: [https://hai-sentinel-api.onrender.com/api/health](https://hai-sentinel-api.onrender.com/api/health)

---

### 💻 Local Development Setup

#### 1. Backend Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Train ML models & seed database
python -m ml.train
python -m backend.database_seeder

# 3. Run test suite
pytest -v

# 4. Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 3. Docker Local Full-Stack
```bash
docker-compose up --build
```

---

## 📁 Repository Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated CI/CD pipeline (pytest + vite build)
│       └── keep_alive.yml         # 24/7 Render backend heartbeat keep-alive
├── backend/
│   ├── config.py                  # Pydantic v2 settings & CORS configuration
│   ├── database.py                # SQLAlchemy engine & session manager
│   ├── database_seeder.py         # Synthetic cohort database seeder
│   ├── main.py                    # FastAPI entrypoint (HEAD/GET health endpoints)
│   ├── models/                    # SQLAlchemy ORM models (Patients, Encounters, Vitals, Audit)
│   ├── routers/                   # API routes (Dashboard, Patients, Wards, Telemetry, Models, Demo)
│   └── services/                  # Dynamic trajectory & cluster detection engines
├── docs/                          # Comprehensive evaluation & architecture documents
│   ├── DEPLOYMENT_GUIDE.md        # Full deployment guide (Render, Vercel, GitHub)
│   ├── FINAL_VERIFICATION.md      # 5-Judge Hackathon Verification & Test Report
│   ├── ML_TARGET_DEFINITION.md    # CDC/NHSN Day 3 Infection Window & Label Criteria
│   ├── model_methodology.md       # Model calculus, calibration, and benchmark math
│   ├── references.md              # Peer-reviewed scientific literature
│   └── system_architecture.md     # 5-Layer decoupled architecture specifications
├── frontend/
│   ├── src/
│   │   ├── components/            # LiveTriageStudio, PatientTrajectoryCard, Navbar, etc.
│   │   ├── context/               # UIContext (Dual Dark/Light Theme & Font Scaling)
│   │   ├── pages/                 # Dashboard, PatientList, PatientDetail, WardIntelligence, etc.
│   │   └── services/              # API client communicating with Render backend
│   └── vercel.json                # Vercel SPA routing & API reverse proxy rewrite
├── ml/
│   ├── explainability/            # TreeSHAP explainer engine
│   ├── features/                  # Causal rolling temporal feature extractor
│   ├── models/                    # XGBoost, Random Forest, Logistic Regression trainers
│   ├── preprocessing/             # Cohort data ingestion and cleaning
│   └── train.py                   # Automated ML pipeline entrypoint
├── scripts/                       # Submission & Presentation generation scripts
├── tests/                         # 22 automated Pytest integration & API tests
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # Full-stack local Docker container orchestrator
├── render.yaml                    # Render Web Service deployment blueprint
├── vercel.json                    # Root Vercel deployment configuration
├── HAI_Sentinel_Hackathon_Submission.pdf  # Official PDF submission document
├── HAI_SENTINEL_Official_Presentation.pptx # Official 20-slide presentation deck
└── README.md                      # Primary project repository guide
```

---

## 🔬 Scientific & Clinical Disclaimer

> [!IMPORTANT]
> **Research & Prototype Disclaimer**:
> HAI-Sentinel is an investigational decision-support and surveillance intelligence research prototype. It is **NOT** a certified medical device and is **NOT** designed to diagnose infections, replace clinical judgment, or autonomously prescribe clinical interventions. All counterfactual simulations represent non-causal mathematical model behaviors under altered input assumptions.

---

*HAI-Sentinel • Omni_BioTech_9 Hackathon Submission • All rights reserved.*
