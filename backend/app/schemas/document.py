"""Pydantic schemas for document-related API requests and responses."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    """Document data returned to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    file_size_bytes: int
    page_count: int
    status: DocumentStatus
    error_message: str | None
    uploaded_at: datetime


class DocumentListResponse(BaseModel):
    """A list of documents, for the document-picker UI."""

    documents: list[DocumentResponse]
    total: int


class ChunkResponse(BaseModel):
    """A single chunk, used when showing citation source content."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    content: str
    page_number: int
    chunk_index: int