"""Pydantic schemas for flashcard and quiz generation."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.quiz import DifficultyLevel, QuestionType


class GenerateStudyMaterialRequest(BaseModel):
    """Request to generate flashcards or quiz questions for a document."""

    document_id: str
    count: int = Field(default=5, ge=1, le=20)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM


class FlashcardResponse(BaseModel):
    """A single flashcard returned to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    question: str
    answer: str
    difficulty: DifficultyLevel
    source_page: int
    created_at: datetime


class FlashcardListResponse(BaseModel):
    """A set of flashcards for a document."""

    flashcards: list[FlashcardResponse]
    total: int


class QuizQuestionResponse(BaseModel):
    """A single quiz question returned to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    question_type: QuestionType
    question: str
    correct_answer: str
    options: list[str] | None
    explanation: str
    difficulty: DifficultyLevel
    source_page: int
    created_at: datetime


class QuizResponse(BaseModel):
    """A set of quiz questions for a document."""

    questions: list[QuizQuestionResponse]
    total: int