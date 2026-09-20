"""ChromaDB client wrapper for vector storage and retrieval."""
from functools import lru_cache

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import get_settings

settings = get_settings()


@lru_cache
def get_chroma_client() -> chromadb.ClientAPI:
    """Return a cached, persistent ChromaDB client."""
    settings.ensure_directories()
    return chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def get_or_create_collection(name: str | None = None) -> chromadb.Collection:
    """Return the shared document collection, creating it if needed."""
    client = get_chroma_client()
    collection_name = name or settings.chroma_collection_name
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )