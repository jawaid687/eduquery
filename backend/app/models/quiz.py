"""Flashcard and quiz ORM models."""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class DifficultyLevel(str, enum.Enum):
    """How challenging a study item is."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionType(str, enum.Enum):
    """The format of a quiz question."""

    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"


class Flashcard(Base):
    """A single question/answer flashcard generated from a document."""

    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM
    )
    source_page: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class QuizQuestion(Base):
    """A single quiz question generated from a document."""

    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=False
    )
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON-encoded list, only for multiple_choice
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM
    )
    source_page: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )