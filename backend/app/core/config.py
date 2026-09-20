"""Application configuration loaded from environment variables."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings, populated from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "EduQuery API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

       # Groq (chat) + local embeddings
    groq_api_key: str = ""
    groq_chat_model: str = "openai/gpt-oss-120b"
    embedding_model_name: str = "all-MiniLM-L6-v2"

    # Database
    database_url: str = "sqlite:///./eduquery.db"

    # Vector store
    chroma_persist_dir: str = "./data/chroma"
    chroma_collection_name: str = "eduquery_documents"

    # File storage
    upload_dir: str = "./data/uploads"
    max_upload_size_mb: int = 50

    # CORS
    backend_cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",")]

    def ensure_directories(self) -> None:
        """Create required runtime directories if they don't exist."""
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
        Path(self.chroma_persist_dir).mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (loaded once per process)."""
    return Settings()