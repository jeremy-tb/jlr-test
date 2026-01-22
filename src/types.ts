// Database models
export interface Text {
  id: number;
  title: string;
  original_text: string;
  week_number: number;
  created_at: string;
}

export interface Recording {
  id: number;
  text_id: number;
  transcribed_text: string;
  created_at: string;
}

export interface Grade {
  id: number;
  recording_id: number;
  fluency_score: number;
  accuracy_score: number;
  feedback: string;
  created_at: string;
}

// Combined view for display
export interface RecordingWithGrade extends Recording {
  grade?: Grade;
}

export interface TextWithRecordings extends Text {
  recordings: RecordingWithGrade[];
}

// API request/response types
export interface OCRRequest {
  imageBase64: string;
}

export interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface GradeRequest {
  originalText: string;
  transcribedText: string;
}

export interface GradeResponse {
  success: boolean;
  fluencyScore?: number;
  accuracyScore?: number;
  feedback?: string;
  error?: string;
}

// App state
export type Page = 'texts' | 'text-detail' | 'history';

export interface AppState {
  currentPage: Page;
  selectedTextId: number | null;
}
