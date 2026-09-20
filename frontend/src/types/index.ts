export interface HealthStatus {
  status: string;
  service: string;
}

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export interface Document {
  id: string;
  filename: string;
  file_size_bytes: number;
  page_count: number;
  status: DocumentStatus;
  error_message: string | null;
  uploaded_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface Citation {
  filename: string;
  page_number: number;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Flashcard {
  id: string;
  document_id: string;
  question: string;
  answer: string;
  difficulty: DifficultyLevel;
  source_page: number;
  created_at: string;
}

export interface FlashcardListResponse {
  flashcards: Flashcard[];
  total: number;
}

export type QuestionType = "multiple_choice" | "short_answer";

export interface QuizQuestion {
  id: string;
  document_id: string;
  question_type: QuestionType;
  question: string;
  correct_answer: string;
  options: string[] | null;
  explanation: string;
  difficulty: DifficultyLevel;
  source_page: number;
  created_at: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  total: number;
}