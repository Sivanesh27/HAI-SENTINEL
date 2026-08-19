# HAI-Sentinel
### Explainable AI Early-Warning & Prevention Intelligence for Hospital-Acquired Infections

> **"Don't wait for the infection. Detect the trajectory."**
> 
> *An Infection-Prevention Decision Support & Surveillance Intelligence Prototype for Intensive Care Units.*

---

## 🏥 Project Overview

**HAI-Sentinel** is an explainable clinical decision-support and infection-prevention platform developed for the **Omni_BioTech_9** challenge ("Predicting Hospital-Acquired Infections"). 

Rather than relying on static, admission-only scores or post-hoc microbiology culture confirmations, HAI-Sentinel continuously computes dynamic risk trajectories ($t-24\text{h} \to t_0$), calculates risk velocity ($\Delta \text{Risk}/\Delta t$) and acceleration, provides local SHAP-based feature attributions, flags emerging ward-level contagion clusters, and prioritizes patients for Infection Prevention and Control (IPC) rounding.

```
PREDICT ──► EXPLAIN ──► TRACK ──► PRIORITIZE ──► PREVENT
```

---

## 🔬 Scientific & Clinical Disclaimer

> [!IMPORTANT]
> **Research & Prototype Disclaimer**:
> HAI-Sentinel is an investigational decision-support and surveillance intelligence research prototype. It is **NOT** a certified medical device and is **NOT** designed to diagnose infections, replace clinical judgment, or autonomously prescribe clinical interventions. All counterfactual simulations represent non-causal mathematical model behaviors under altered input assumptions.

---

## 🛠️ Architecture & Technology Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, SQLite / PostgreSQL
- **Machine Learning Core**: scikit-learn, XGBoost, LightGBM, SHAP (TreeExplainer), Isotonic Calibration
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Testing**: pytest, vitest / tsc, httpx

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
# From workspace root
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run test suite
pytest

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Visit the frontend at `http://localhost:5173`. API docs available at `http://localhost:8000/docs`.

---

## 📁 Repository Structure

```
.
├── backend/            # FastAPI API server, database models, and routes
├── frontend/           # React + TypeScript + Vite clinical dashboard
├── ml/                 # Feature engineering, model training, and SHAP pipelines
├── data/               # Demo/synthetic datasets and MIMIC-IV ETL scripts
├── docs/               # Scientific methodology, literature review, and API specs
├── models/             # Serialized model weights, calibrations, and metadata
├── scripts/            # Database initialization, training, and demo scripts
├── tests/              # Backend, ML, and API automated test suites
├── docker-compose.yml  # Multi-container orchestration
└── README.md
```
