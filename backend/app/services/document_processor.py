"""PDF text extraction and semantic chunking."""
from dataclasses import dataclass

import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter


@dataclass
class ExtractedChunk:
    """A single chunk of text with its source page number."""

    content: str
    page_number: int
    chunk_index: int


def extract_pages(file_path: str) -> list[tuple[int, str]]:
    """Extract raw text from each page of a PDF.

    Returns a list of (page_number, text) tuples. Page numbers start at 1.
    """
    pages: list[tuple[int, str]] = []
    with pdfplumber.open(file_path) as pdf:
        for index, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append((index, text))
    return pages


def chunk_pages(
    pages: list[tuple[int, str]],
    chunk_size: int = 1000,
    chunk_overlap: int = 150,
) -> list[ExtractedChunk]:
    """Split page text into overlapping chunks, preserving page attribution.

    Each page is split independently so that every resulting chunk can be
    confidently attributed to a single page number for citations.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[ExtractedChunk] = []
    global_index = 0
    for page_number, page_text in pages:
        page_splits = splitter.split_text(page_text)
        for split_text in page_splits:
            chunks.append(
                ExtractedChunk(
                    content=split_text,
                    page_number=page_number,
                    chunk_index=global_index,
                )
            )
            global_index += 1

    return chunks


def process_pdf(
    file_path: str, chunk_size: int = 1000, chunk_overlap: int = 150
) -> tuple[int, list[ExtractedChunk]]:
    """Extract and chunk a PDF file.

    Returns (page_count, chunks).
    """
    pages = extract_pages(file_path)
    chunks = chunk_pages(pages, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return len(pages), chunks