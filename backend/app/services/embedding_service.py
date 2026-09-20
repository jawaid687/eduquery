"""Embedding generation and storage in ChromaDB."""
import uuid

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import get_settings
from app.core.vectorstore import get_or_create_collection
from app.services.document_processor import ExtractedChunk

settings = get_settings()


def get_embeddings_client() -> GoogleGenerativeAIEmbeddings:
    """Return a configured Gemini embeddings client."""
    return GoogleGenerativeAIEmbeddings(
        model=settings.gemini_embedding_model,
        google_api_key=settings.google_api_key,
    )


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

    embeddings_client = get_embeddings_client()
    collection = get_or_create_collection()

    texts = [chunk.content for chunk in chunks]
    vectors = embeddings_client.embed_documents(texts)

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