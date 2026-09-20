import type {
  ChatResponse,
  Document,
  DocumentListResponse,
  FlashcardListResponse,
  QuizResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await apiClient.get<{ status: string }>("/health");
    return true;
  } catch {
    return false;
  }
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  return response.json() as Promise<Document>;
}

export async function listDocuments(): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>("/api/v1/documents");
}

export async function getDocument(documentId: string): Promise<Document> {
  return apiClient.get<Document>(`/api/v1/documents/${documentId}`);
}

export async function deleteDocument(documentId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/documents/${documentId}`);
}

export async function askQuestion(
  query: string,
  documentId: string | null,
  topK = 5,
): Promise<ChatResponse> {
  return apiClient.post<ChatResponse>("/api/v1/chat", {
    query,
    document_id: documentId,
    top_k: topK,
  });
}

export async function generateFlashcards(
  documentId: string,
  count = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<FlashcardListResponse> {
  return apiClient.post<FlashcardListResponse>("/api/v1/study/flashcards", {
    document_id: documentId,
    count,
    difficulty,
  });
}

export async function listFlashcards(documentId: string): Promise<FlashcardListResponse> {
  return apiClient.get<FlashcardListResponse>(`/api/v1/study/flashcards/${documentId}`);
}

export async function generateQuiz(
  documentId: string,
  count = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<QuizResponse> {
  return apiClient.post<QuizResponse>("/api/v1/study/quiz", {
    document_id: documentId,
    count,
    difficulty,
  });
}

export async function listQuizQuestions(documentId: string): Promise<QuizResponse> {
  return apiClient.get<QuizResponse>(`/api/v1/study/quiz/${documentId}`);
}