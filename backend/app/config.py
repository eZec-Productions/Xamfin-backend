import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finlytics AI Backend"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finlytics-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: If DATABASE_URL is set (e.g. postgresql://user:pass@localhost:5432/finlytics), use PostgreSQL,
    # otherwise default to SQLite for seamless instant local runs.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finlytics.db")

    # Allowed CORS origins for Next.js frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    # AI Provider Configuration ("gemini" or "openai")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")

    # Google Gemini Configuration (Paid API)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    GEMINI_BASE_URL: str = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

    # OpenAI Configuration (Fallback/Alternative)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Database environment variables (optional overrides)
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "Finlytics Ai"

    # SendGrid Email Configuration
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SENDGRID_FROM_EMAIL: str = os.getenv("SENDGRID_FROM_EMAIL", "notifications@finlytics.ai")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
