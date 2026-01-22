import { Text, TextWithRecordings, OCRResponse, GradeResponse } from './types';

const API_BASE = '/api';

// Text operations
export async function getTexts(): Promise<Text[]> {
  const response = await fetch(`${API_BASE}/texts`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.texts;
}

export async function getText(id: number): Promise<TextWithRecordings> {
  const response = await fetch(`${API_BASE}/texts?id=${id}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.text;
}

export async function createText(title: string, originalText: string, weekNumber: number): Promise<Text> {
  const response = await fetch(`${API_BASE}/texts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, original_text: originalText, week_number: weekNumber }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.text;
}

export async function deleteText(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/texts?id=${id}`, { method: 'DELETE' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
}

// Recording operations
export async function createRecording(textId: number, transcribedText: string): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE}/recordings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_id: textId, transcribed_text: transcribedText }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.recording;
}

// Grade operations
export async function getGradeHistory(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/grades`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.grades;
}

export async function saveGrade(recordingId: number, fluencyScore: number, accuracyScore: number, feedback: string): Promise<void> {
  const response = await fetch(`${API_BASE}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recording_id: recordingId, fluency_score: fluencyScore, accuracy_score: accuracyScore, feedback }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
}

// OCR operation
export async function performOCR(imageBase64: string): Promise<OCRResponse> {
  const response = await fetch(`${API_BASE}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  return response.json();
}

// AI Grading operation
export async function performGrading(originalText: string, transcribedText: string): Promise<GradeResponse> {
  const response = await fetch(`${API_BASE}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalText, transcribedText }),
  });
  return response.json();
}

// Database setup
export async function setupDatabase(): Promise<void> {
  const response = await fetch(`${API_BASE}/db-setup`, { method: 'POST' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
}
