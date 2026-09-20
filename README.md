# EduQuery — Autonomous Lecture & Exam Preparation Assistant

An AI-powered study assistant that lets students upload lecture slides, PDFs, and notes, then interact with them through Retrieval-Augmented Generation (RAG). The assistant answers questions strictly from the uploaded materials and cites the exact page or slide it drew the answer from — no hallucinated facts, no guessing outside the provided material.

## Features

- **Multi-document upload** with automatic PDF text extraction and page-aware semantic chunking
- **RAG-based Q&A** — answers are grounded only in retrieved chunks, with accurate page-level citations (e.g. *"According to Slide 3 of Database_Normalization.pdf..."*)
- **Auto-generated study materials** — flashcards and quizzes *(in progress)*
- **Dual-pane interface** — document viewer on the left, AI chat on the right *(in progress)*

## Tech Stack

| Layer     | Technology                                                    |
|-----------|---------------------------------------------------------------|
| Frontend  | Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI     |
| Backend   | FastAPI, Python 3.12                                          |
| AI / RAG  | LangChain, ChromaDB, Google Gemini API                        |
| Database  | SQLite (dev), SQLAlchemy ORM                                  |

## Project Structure

```
eduquery/
  backend/     FastAPI application (API, RAG pipeline, database models)
  frontend/    Next.js application (UI)
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- A free Google Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Backend setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
cp .env.example .env          # then add your GOOGLE_API_KEY
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`. Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs`.

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at `http://localhost:3000`.

## How It Works

1. A PDF is uploaded and its text is extracted page by page.
2. Each page's text is split into overlapping chunks, with every chunk tagged to the page it came from.
3. Each chunk is converted into a vector embedding (Google Gemini) and stored in ChromaDB.
4. When a question is asked, it's embedded and matched against the stored chunks by semantic similarity.
5. The most relevant chunks are passed to Gemini's chat model, along with a prompt that restricts it to answering only from that retrieved content.
6. The generated answer is returned along with citations pointing back to the exact source document and page.

## Progress

- [x] Project initialization — backend and frontend skeletons
- [x] Document upload, PDF extraction, and chunking
- [x] Embedding generation and vector storage (ChromaDB)
- [x] RAG-based question answering with citations
- [ ] Flashcard and quiz generation
- [ ] Frontend document viewer and chat UI

## License

MIT