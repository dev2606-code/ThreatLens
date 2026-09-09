from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.indicators import router as indicators_router
from backend.app.core.database import Base, engine
from backend.app.models.indicator import Indicator

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ThreatLens API",
    description="Cyber Threat Intelligence Dashboard API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(indicators_router)


@app.get("/")
def home():
    return {
        "project": "ThreatLens",
        "message": "ThreatLens API is running",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "feeds_online": 8,
        "total_feeds": 8,
    }


@app.get("/api/dashboard/stats")
def dashboard_stats():
    return {
        "active_indicators": 12847,
        "critical_threats": 24,
        "open_alerts": 156,
        "feeds_online": 8,
    }