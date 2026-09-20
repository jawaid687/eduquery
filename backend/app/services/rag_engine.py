"""RAG answer generation: combines retrieval with Gemini chat generation."""
from dataclasses import dataclass

from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.services.retrieval_service import RetrievedChunk, retrieve_relevant_chunks

settings = get_settings()

SYSTEM_PROMPT = """You are EduQuery, a study assistant that answers questions \
strictly using the provided lecture material excerpts below. Follow these rules:

1. Only use information found in the excerpts. Never use outside knowledge.
2. If the excerpts do not contain enough information to answer the question, \
say so clearly instead of guessing.
3. When you state a fact, mention which source it came from, referring to it \
by its filename and page number, in the style: "According to Slide 3 of \
{{filename}}...".
4. Keep answers concise and focused on what was actually asked.

Excerpts:
{context}
"""


@dataclass
class Citation:
    """A single source reference backing part of an answer."""

    filename: str
    page_number: int
    excerpt: str


@dataclass
class RagAnswer:
    """A generated answer along with the sources that support it."""

    answer: str
    citations: list[Citation]


def _build_context(chunks: list[RetrievedChunk]) -> str:
    """Format retrieved chunks into a numbered context block for the prompt."""
    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        blocks.append(
            f"[Source {i}: {chunk.filename}, page {chunk.page_number}]\n"
            f"{chunk.content}"
        )
    return "\n\n".join(blocks)


def get_chat_client() -> ChatGoogleGenerativeAI:
    """Return a configured Gemini chat client."""
    return ChatGoogleGenerativeAI(
        model=settings.gemini_chat_model,
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )


def answer_question(query: str, document_id: str | None = None, top_k: int = 5) -> RagAnswer:
    """Answer a question using retrieval-augmented generation."""
    chunks = retrieve_relevant_chunks(query, top_k=top_k, document_id=document_id)

    if not chunks:
        return RagAnswer(
            answer=(
                "I couldn't find any relevant material in your uploaded documents "
                "to answer that question."
            ),
            citations=[],
        )

    context = _build_context(chunks)
    prompt = SYSTEM_PROMPT.format(context=context)

    chat_client = get_chat_client()
    response = chat_client.invoke(
        [
            {"role": "system", "content": prompt},
            {"role": "user", "content": query},
        ]
    )

    citations = [
        Citation(
            filename=chunk.filename,
            page_number=chunk.page_number,
            excerpt=chunk.content[:200],
        )
        for chunk in chunks
    ]

    return RagAnswer(answer=response.content, citations=citations)