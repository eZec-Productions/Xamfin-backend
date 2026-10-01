from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models import *  # import all models so Base has them registered
from app.routers import (
    auth,
    dashboard,
    documents,
    reports,
    transactions,
    chat,
    settings as settings_router,
    admin,
    plans
)

# Initialize database schema (Creates tables if not present in SQLite or PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"], # Allow all during local dev for seamless testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(plans.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
