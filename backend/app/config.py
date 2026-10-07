"""Environment-backed configuration for the FarmDirect API."""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")


class Settings:
    """Central place for settings that future backend stages can extend."""

    app_name: str = "FarmDirect API"
    app_description: str = "Backend API for the FarmDirect farmer-to-customer marketplace"
    app_version: str = "1.0.0"
    database_url: str = os.getenv("DATABASE_URL", "").strip()
    jwt_secret: str = os.getenv("JWT_SECRET_KEY", "")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    cors_origins: list[str] = [
        origin
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5174,"
            "http://127.0.0.1:5173,http://127.0.0.1:5174",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()