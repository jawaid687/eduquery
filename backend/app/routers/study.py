"""Flashcard and quiz generation/retrieval endpoints."""
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.document import Document
from app.models.quiz import Flashcard, QuestionType, QuizQuestion
from app.schemas.quiz import (
    FlashcardListResponse,
    FlashcardResponse,
    GenerateStudyMaterialRequest,
    QuizQuestionResponse,
    QuizResponse,
)
from app.services.study_generator import generate_flashcards_raw, generate_quiz_raw

router = APIRouter(prefix="/api/v1/study", tags=["study"])


def _get_document_or_404(db: Session, document_id: str) -> Document:
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )
    return document


def _quiz_question_to_response(q: QuizQuestion) -> QuizQuestionResponse:
    """Convert a QuizQuestion ORM row into its response schema."""
    return QuizQuestionResponse(
        id=q.id,
        document_id=q.document_id,
        question_type=q.question_type,
        question=q.question,
        correct_answer=q.correct_answer,
        options=json.loads(q.options) if q.options else None,
        explanation=q.explanation,
        difficulty=q.difficulty,
        source_page=q.source_page,
        created_at=q.created_at,
    )


@router.post(
    "/flashcards",
    response_model=FlashcardListResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_flashcards(
    request: GenerateStudyMaterialRequest,
    db: Session = Depends(get_db),
) -> FlashcardListResponse:
    """Generate and save a new batch of flashcards for a document."""
    _get_document_or_404(db, request.document_id)

    try:
        raw_cards = generate_flashcards_raw(
            db, request.document_id, request.count, request.difficulty
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {exc}",
        ) from exc

    saved_cards = []
    for card in raw_cards:
        flashcard = Flashcard(
            document_id=request.document_id,
            question=card["question"],
            answer=card["answer"],
            difficulty=request.difficulty,
            source_page=card["source_page"],
        )
        db.add(flashcard)
        saved_cards.append(flashcard)

    db.commit()
    for card in saved_cards:
        db.refresh(card)

    return FlashcardListResponse(
        flashcards=[FlashcardResponse.model_validate(c) for c in saved_cards],
        total=len(saved_cards),
    )


@router.get("/flashcards/{document_id}", response_model=FlashcardListResponse)
def list_flashcards(
    document_id: str, db: Session = Depends(get_db)
) -> FlashcardListResponse:
    """List all previously generated flashcards for a document."""
    _get_document_or_404(db, document_id)
    cards = (
        db.query(Flashcard).filter(Flashcard.document_id == document_id).all()
    )
    return FlashcardListResponse(
        flashcards=[FlashcardResponse.model_validate(c) for c in cards],
        total=len(cards),
    )


@router.post(
    "/quiz", response_model=QuizResponse, status_code=status.HTTP_201_CREATED
)
def generate_quiz(
    request: GenerateStudyMaterialRequest,
    db: Session = Depends(get_db),
) -> QuizResponse:
    """Generate and save a new quiz for a document."""
    _get_document_or_404(db, request.document_id)

    try:
        raw_questions = generate_quiz_raw(
            db, request.document_id, request.count, request.difficulty
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {exc}",
        ) from exc

    saved_questions = []
    for q in raw_questions:
        options = q.get("options")
        question = QuizQuestion(
            document_id=request.document_id,
            question_type=QuestionType(q["question_type"]),
            question=q["question"],
            correct_answer=q["correct_answer"],
            options=json.dumps(options) if options else None,
            explanation=q["explanation"],
            difficulty=request.difficulty,
            source_page=q["source_page"],
        )
        db.add(question)
        saved_questions.append(question)

    db.commit()
    for q in saved_questions:
        db.refresh(q)

    return QuizResponse(
        questions=[_quiz_question_to_response(q) for q in saved_questions],
        total=len(saved_questions),
    )


@router.get("/quiz/{document_id}", response_model=QuizResponse)
def list_quiz_questions(
    document_id: str, db: Session = Depends(get_db)
) -> QuizResponse:
    """List all previously generated quiz questions for a document."""
    _get_document_or_404(db, document_id)
    questions = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.document_id == document_id)
        .all()
    )
    return QuizResponse(
        questions=[_quiz_question_to_response(q) for q in questions],
        total=len(questions),
    )