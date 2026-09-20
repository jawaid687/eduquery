"""Embedding generation (local model) and storage in ChromaDB."""
import uuid
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import get_settings
from app.core.vectorstore import get_or_create_collection
from app.services.document_processor import ExtractedChunk

settings = get_settings()


@lru_cache
def get_embedding_model() -> SentenceTransformer:
    """Return a cached local embedding model instance.

    Loaded once per process since model loading is relatively slow;
    subsequent calls reuse the same in-memory model.
    """
    return SentenceTransformer(settings.embedding_model_name)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts using the local embedding model."""
    model = get_embedding_model()
    vectors = model.encode(texts, convert_to_numpy=True)
    return vectors.tolist()


def embed_query(text: str) -> list[float]:
    """Embed a single query string."""
    return embed_texts([text])[0]


def embed_and_store_chunks(
    document_id: str,
    filename: str,
    chunks: list[ExtractedChunk],
) -> list[str]:
    """Embed each chunk and store it in ChromaDB.

    Returns the list of vector IDs, in the same order as the input chunks,
    so the caller can link each ChromaDB entry back to a database row.
    """
    if not chunks:
        return []

    collection = get_or_create_collection()

    texts = [chunk.content for chunk in chunks]
    vectors = embed_texts(texts)

    vector_ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {
            "document_id": document_id,
            "filename": filename,
            "page_number": chunk.page_number,
            "chunk_index": chunk.chunk_index,
        }
        for chunk in chunks
    ]

    collection.add(
        ids=vector_ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas,
    )

    return vector_ids