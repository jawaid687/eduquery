"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import Base, engine
from app.routers import chat, documents
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown routines."""
    settings.ensure_directories()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents.router)
app.include_router(chat.router)

@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Simple liveness check used by the frontend and deployment tooling."""
    return {"status": "ok", "service": settings.app_name}