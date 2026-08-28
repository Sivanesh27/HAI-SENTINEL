from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers.patients import router as patients_router
from backend.routers.wards import router as wards_router
from backend.routers.dashboard import router as dashboard_router
from backend.routers.models_router import router as models_router
from backend.routers.audit import router as audit_router
from backend.routers.demo import router as demo_router
from backend.routers.telemetry import router as telemetry_router

from backend.database import engine, Base

# Create tables if not existing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HAI-Sentinel API",
    description="Explainable AI Early-Warning & Prevention Intelligence for Hospital-Acquired Infections",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(patients_router)
app.include_router(wards_router)
app.include_router(dashboard_router)
app.include_router(models_router)
app.include_router(audit_router)
app.include_router(demo_router)
app.include_router(telemetry_router)


@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["System"])
def health_check():
    """Health check endpoint confirming API status and scientific disclaimer."""
    return {
        "status": "online",
        "app_name": "HAI-Sentinel",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "disclaimer": (
            "HAI-Sentinel is a research & hackathon prototype decision-support system. "
            "It does not provide clinical diagnoses or replace medical professionals."
        ),
    }


@app.api_route("/", methods=["GET", "HEAD"], tags=["Root"])
def root():
    return {
        "status": "online",
        "message": "Welcome to HAI-Sentinel API. Visit /docs for OpenAPI documentation."
    }

