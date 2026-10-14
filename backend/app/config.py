import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PotholeGuard"
    PROJECT_TITLE: str = "AI-Based Real-Time Pothole Detection, Severity Analysis and Geolocation System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "potholeguard_super_secret_jwt_key_2026_antigravity_vision")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Supports PostgreSQL by default, with SQLite auto-fallback if PostgreSQL is unconfigured)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "potholeguard")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    
    # Storage
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))
    WEIGHTS_DIR: str = os.getenv("WEIGHTS_DIR", os.path.join(BASE_DIR, "weights"))
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.WEIGHTS_DIR, exist_ok=True)
