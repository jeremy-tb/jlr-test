import { useState, useEffect, useRef } from 'react';
import { Text } from '../types';
import { getTexts, createText, deleteText, performOCR, setupDatabase } from '../api';

interface Props {
  onSelectText: (id: number) => void;
}

export default function TextsList({ onSelectText }: Props) {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newWeek, setNewWeek] = useState(1);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const data = await getTexts();
      setTexts(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDB = async () => {
    try {
      await setupDatabase();
      alert('Database setup complete!');
      loadTexts();
    } catch (err) {
      alert('Database setup failed: ' + String(err));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await performOCR(base64);
        if (result.success && result.text) {
          setNewText(result.text);
        } else {
          alert('OCR failed: ' + (result.error || 'Unknown error'));
        }
        setOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Failed to process image: ' + String(err));
      setOcrLoading(false);
    }
  };

  const handleCreateText = async () => {
    if (!newTitle.trim() || !newText.trim()) {
      alert('Please enter both title and text');
      return;
    }

    try {
      await createText(newTitle, newText, newWeek);
      setNewTitle('');
      setNewText('');
      setNewWeek(1);
      setShowAddForm(false);
      loadTexts();
    } catch (err) {
      alert('Failed to create text: ' + String(err));
    }
  };

  const handleDeleteText = async (id: number) => {
    if (!confirm('Delete this text and all its recordings?')) return;
    try {
      await deleteText(id);
      loadTexts();
    } catch (err) {
      alert('Failed to delete: ' + String(err));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="texts-list">
      <div className="page-header">
        <h1>Practice Texts</h1>
        <div className="header-actions">
          <button onClick={handleSetupDB} className="btn-secondary">Setup DB</button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : 'Add New Text'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-form">
          <h3>Add New Text</h3>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Week 5 Reading"
            />
          </div>
          <div className="form-group">
            <label>Week Number:</label>
            <input
              type="number"
              value={newWeek}
              onChange={(e) => setNewWeek(Number(e.target.value))}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Text Content:</label>
            <div className="image-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={ocrLoading}
                className="btn-secondary"
              >
                {ocrLoading ? 'Processing...' : 'Upload Image (OCR)'}
              </button>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter the Mandarin text or upload an image"
              rows={6}
            />
          </div>
          <button onClick={handleCreateText} className="btn-primary">Save Text</button>
        </div>
      )}

      {texts.length === 0 ? (
        <div className="empty-state">
          <p>No texts yet. Add your first text to start practicing!</p>
        </div>
      ) : (
        <div className="texts-grid">
          {texts.map((text) => (
            <div key={text.id} className="text-card">
              <div className="text-card-header">
                <span className="week-badge">Week {text.week_number}</span>
                <h3>{text.title}</h3>
              </div>
              <p className="text-preview">
                {text.original_text.substring(0, 100)}
                {text.original_text.length > 100 ? '...' : ''}
              </p>
              <div className="text-card-actions">
                <button onClick={() => onSelectText(text.id)} className="btn-primary">
                  Practice
                </button>
                <button onClick={() => handleDeleteText(text.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
