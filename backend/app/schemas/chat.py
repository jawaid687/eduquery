"""Pydantic schemas for chat/Q&A requests and responses."""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """A question submitted by the user."""

    query: str = Field(..., min_length=1, max_length=2000)
    document_id: str | None = Field(
        default=None,
        description="If set, restrict retrieval to this document only.",
    )
    top_k: int = Field(default=5, ge=1, le=15)


class CitationResponse(BaseModel):
    """A single source reference backing part of an answer."""

    filename: str
    page_number: int
    excerpt: str


class ChatResponse(BaseModel):
    """The generated answer along with its supporting citations."""

    answer: str
    citations: list[CitationResponse]