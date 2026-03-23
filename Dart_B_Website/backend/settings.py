import os
from typing import List
from functools import lru_cache

# Load environment variables from .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Settings:
    """Application settings loaded from environment variables"""

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS Configuration
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
        return [origin.strip() for origin in origins_str.split(",") if origin.strip()]

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dartb-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dartb.db")

    # Google Sheets Integration
    # Sheet ID for member data (from URL: /d/SHEET_ID/edit)
    GOOGLE_SHEETS_ID: str = os.getenv("GOOGLE_SHEETS_ID", "")
    # Service Account JSON (file path or inline JSON)
    GOOGLE_SERVICE_ACCOUNT_JSON: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    # API key for public sheets - supports both GOOGLE_SHEETS_API_KEY and GOOGLE_API_KEY
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_SHEETS_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")

    @property
    def has_google_sheets_config(self) -> bool:
        """Check if Google Sheets integration is configured"""
        return bool(self.GOOGLE_SHEETS_ID) and (
            bool(self.GOOGLE_SERVICE_ACCOUNT_JSON) or bool(self.GOOGLE_API_KEY)
        )

    # Debug Mode
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Export singleton settings
settings = get_settings()
