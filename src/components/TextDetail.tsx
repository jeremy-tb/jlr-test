import { useState, useEffect, useRef } from 'react';
import { TextWithRecordings } from '../types';
import { getText, createRecording, saveGrade, performGrading } from '../api';

interface Props {
  textId: number;
  onBack: () => void;
}

// Web Speech API types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default function TextDetail({ textId, onBack }: Props) {
  const [text, setText] = useState<TextWithRecordings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [lastGrade, setLastGrade] = useState<{
    fluency: number;
    accuracy: number;
    feedback: string;
  } | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    loadText();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [textId]);

  const loadText = async () => {
    try {
      setLoading(true);
      const data = await getText(textId);
      setText(data);
    } catch (err) {
      alert('Failed to load text: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // Mandarin Chinese
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript = transcript;
        }
      }
      setTranscribedText(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscribedText('');
    setLastGrade(null);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleGrade = async () => {
    if (!text || !transcribedText.trim()) {
      alert('Please record your reading first');
      return;
    }

    setIsGrading(true);
    try {
      // Get AI grading
      const gradeResult = await performGrading(text.original_text, transcribedText);

      if (!gradeResult.success) {
        throw new Error(gradeResult.error);
      }

      // Save recording
      const recording = await createRecording(textId, transcribedText);

      // Save grade
      await saveGrade(
        recording.id,
        gradeResult.fluencyScore!,
        gradeResult.accuracyScore!,
        gradeResult.feedback!
      );

      setLastGrade({
        fluency: gradeResult.fluencyScore!,
        accuracy: gradeResult.accuracyScore!,
        feedback: gradeResult.feedback!,
      });

      // Reload to show new recording
      loadText();
    } catch (err) {
      alert('Grading failed: ' + String(err));
    } finally {
      setIsGrading(false);
    }
  };

  const speakText = () => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text.original_text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; // Slightly slower for learning
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!text) return <div className="error-message">Text not found</div>;

  return (
    <div className="text-detail">
      <button onClick={onBack} className="btn-back">Back to Texts</button>

      <div className="text-header">
        <span className="week-badge">Week {text.week_number}</span>
        <h1>{text.title}</h1>
      </div>

      <div className="original-text-section">
        <h2>Original Text</h2>
        <div className="original-text">{text.original_text}</div>
        <button onClick={speakText} className="btn-secondary">
          Listen (TTS)
        </button>
      </div>

      <div className="recording-section">
        <h2>Record Your Reading</h2>
        <div className="recording-controls">
          {!isRecording ? (
            <button onClick={startRecording} className="btn-record">
              Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="btn-stop">
              Stop Recording
            </button>
          )}
        </div>

        {transcribedText && (
          <div className="transcription-result">
            <h3>Your Transcription:</h3>
            <div className="transcribed-text">{transcribedText}</div>
            <button
              onClick={handleGrade}
              disabled={isGrading}
              className="btn-primary"
            >
              {isGrading ? 'Grading...' : 'Grade My Reading'}
            </button>
          </div>
        )}

        {lastGrade && (
          <div className="grade-result">
            <h3>Grade Result</h3>
            <div className="scores">
              <div className="score">
                <span className="score-label">Accuracy:</span>
                <span className="score-value">{lastGrade.accuracy}/10</span>
              </div>
              <div className="score">
                <span className="score-label">Fluency:</span>
                <span className="score-value">{lastGrade.fluency}/10</span>
              </div>
            </div>
            <div className="feedback">
              <strong>Feedback:</strong> {lastGrade.feedback}
            </div>
          </div>
        )}
      </div>

      {text.recordings && text.recordings.length > 0 && (
        <div className="history-section">
          <h2>Past Attempts</h2>
          <div className="attempts-list">
            {text.recordings.map((recording) => (
              <div key={recording.id} className="attempt-card">
                <div className="attempt-date">
                  {new Date(recording.created_at).toLocaleDateString()}
                </div>
                <div className="attempt-transcript">
                  {recording.transcribed_text.substring(0, 50)}...
                </div>
                {recording.grade && (
                  <div className="attempt-scores">
                    <span>Accuracy: {recording.grade.accuracy_score}/10</span>
                    <span>Fluency: {recording.grade.fluency_score}/10</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
