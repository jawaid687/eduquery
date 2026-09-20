"""Semantic retrieval of relevant chunks from ChromaDB."""
from dataclasses import dataclass

from app.core.vectorstore import get_or_create_collection
from app.services.embedding_service import embed_query


@dataclass
class RetrievedChunk:
    """A chunk retrieved from the vector store, with its source metadata."""

    content: str
    document_id: str
    filename: str
    page_number: int
    similarity: float


def retrieve_relevant_chunks(
    query: str,
    top_k: int = 5,
    document_id: str | None = None,
) -> list[RetrievedChunk]:
    """Find the most semantically relevant chunks for a given query.

    If document_id is provided, results are restricted to that document only
    (used when the user is asking about one specific uploaded file).
    """
    query_vector = embed_query(query)

    collection = get_or_create_collection()

    where_filter = {"document_id": document_id} if document_id else None

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        where=where_filter,
    )

    chunks: list[RetrievedChunk] = []
    if not results["ids"] or not results["ids"][0]:
        return chunks

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for text, metadata, distance in zip(documents, metadatas, distances):
        chunks.append(
            RetrievedChunk(
                content=text,
                document_id=metadata["document_id"],
                filename=metadata["filename"],
                page_number=metadata["page_number"],
                similarity=1 - distance,
            )
        )

    return chunks