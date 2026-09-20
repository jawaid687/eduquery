"""Document upload and retrieval endpoints."""
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.models.chunk import Chunk
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentListResponse, DocumentResponse
from app.services.document_processor import process_pdf
from app.services.embedding_service import embed_and_store_chunks

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])
settings = get_settings()


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile,
    db: Session = Depends(get_db),
) -> Document:
    """Upload a PDF, extract its text, chunk it, embed it, and store it."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    settings.ensure_directories()
    document_id = str(uuid.uuid4())
    safe_filename = f"{document_id}_{file.filename}"
    destination = Path(settings.upload_dir) / safe_filename

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = destination.stat().st_size
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if file_size > max_size:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds the {settings.max_upload_size_mb}MB limit.",
        )

    document = Document(
        id=document_id,
        filename=file.filename or safe_filename,
        file_path=str(destination),
        file_size_bytes=file_size,
        status=DocumentStatus.PROCESSING,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        page_count, extracted_chunks = process_pdf(str(destination))

        vector_ids = embed_and_store_chunks(
            document_id=document.id,
            filename=document.filename,
            chunks=extracted_chunks,
        )

        for extracted_chunk, vector_id in zip(extracted_chunks, vector_ids):
            db.add(
                Chunk(
                    document_id=document.id,
                    content=extracted_chunk.content,
                    page_number=extracted_chunk.page_number,
                    chunk_index=extracted_chunk.chunk_index,
                    vector_id=vector_id,
                )
            )

        document.page_count = page_count
        document.status = DocumentStatus.READY
        db.commit()
        db.refresh(document)

    except Exception as exc:
        document.status = DocumentStatus.FAILED
        document.error_message = str(exc)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {exc}",
        ) from exc

    return document


@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db)) -> DocumentListResponse:
    """List all uploaded documents, most recent first."""
    documents = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(doc) for doc in documents],
        total=len(documents),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)) -> Document:
    """Get a single document by ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)) -> None:
    """Delete a document, its file, and its database records."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )

    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()