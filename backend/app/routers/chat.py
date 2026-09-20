"""Chat / RAG question-answering endpoint."""
from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse, CitationResponse
from app.services.rag_engine import answer_question

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def ask_question(request: ChatRequest) -> ChatResponse:
    """Answer a question using retrieval-augmented generation over uploaded documents."""
    try:
        result = answer_question(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate answer: {exc}",
        ) from exc

    return ChatResponse(
        answer=result.answer,
        citations=[
            CitationResponse(
                filename=c.filename,
                page_number=c.page_number,
                excerpt=c.excerpt,
            )
            for c in result.citations
        ],
    )