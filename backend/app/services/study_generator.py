"""Flashcard and quiz generation using Gemini with structured JSON output."""
import json
import re

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.chunk import Chunk
from app.models.quiz import DifficultyLevel
from app.services.rag_engine import generate_text

settings = get_settings()

FLASHCARD_PROMPT = """You are generating study flashcards from lecture material. \
Using ONLY the material below, generate exactly {count} flashcards at \
{difficulty} difficulty.

Respond with ONLY a valid JSON array, no other text, in exactly this format:
[
  {{"question": "...", "answer": "...", "source_page": 1}}
]

Each "source_page" must be one of the page numbers that appears in the \
material below (shown as [Page N]). Do not invent information not present \
in the material.

Material:
{context}
"""

QUIZ_PROMPT = """You are generating a quiz from lecture material. Using ONLY \
the material below, generate exactly {count} questions at {difficulty} \
difficulty. Use a mix of "multiple_choice" and "short_answer" types.

Respond with ONLY a valid JSON array, no other text, in exactly this format:
[
  {{
    "question_type": "multiple_choice",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_answer": "...",
    "explanation": "...",
    "source_page": 1
  }},
  {{
    "question_type": "short_answer",
    "question": "...",
    "options": null,
    "correct_answer": "...",
    "explanation": "...",
    "source_page": 1
  }}
]

For "multiple_choice" questions, "options" must contain exactly 4 choices, \
one of which exactly matches "correct_answer". For "short_answer" questions, \
"options" must be null. Each "source_page" must be one of the page numbers \
that appears in the material below (shown as [Page N]). Do not invent \
information not present in the material.

Material:
{context}
"""


def _get_document_context(db: Session, document_id: str) -> str:
    """Fetch all chunks for a document and format them with page markers."""
    chunks = (
        db.query(Chunk)
        .filter(Chunk.document_id == document_id)
        .order_by(Chunk.chunk_index)
        .all()
    )
    return "\n\n".join(f"[Page {c.page_number}]\n{c.content}" for c in chunks)


def _extract_json_array(raw_text: str) -> list[dict]:
    """Extract and parse a JSON array from the model's raw text response.

    Gemini sometimes wraps JSON in markdown code fences despite instructions
    not to, so we strip those before parsing.
    """
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip())
    return json.loads(cleaned)


def generate_flashcards_raw(
    db: Session,
    document_id: str,
    count: int,
    difficulty: DifficultyLevel,
) -> list[dict]:
    """Generate flashcard data (not yet saved to DB) for a document."""
    context = _get_document_context(db, document_id)
    if not context.strip():
        return []

    prompt = FLASHCARD_PROMPT.format(
        count=count, difficulty=difficulty.value, context=context
    )
    raw_response = generate_text(prompt=prompt)

    return _extract_json_array(raw_response)


def generate_quiz_raw(
    db: Session,
    document_id: str,
    count: int,
    difficulty: DifficultyLevel,
) -> list[dict]:
    """Generate quiz question data (not yet saved to DB) for a document."""
    context = _get_document_context(db, document_id)
    if not context.strip():
        return []

    prompt = QUIZ_PROMPT.format(
        count=count, difficulty=difficulty.value, context=context
    )
    raw_response = generate_text(prompt=prompt)

    return _extract_json_array(raw_response)