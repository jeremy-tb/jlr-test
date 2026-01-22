import { useState, useEffect } from 'react';
import { getGradeHistory } from '../api';

interface GradeEntry {
  id: number;
  recording_id: number;
  fluency_score: number;
  accuracy_score: number;
  feedback: string;
  created_at: string;
  text_title: string;
  week_number: number;
  transcribed_text: string;
}

export default function GradeHistory() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await getGradeHistory();
      setGrades(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = () => {
    if (grades.length === 0) return { accuracy: 0, fluency: 0 };
    const totals = grades.reduce(
      (acc, g) => ({
        accuracy: acc.accuracy + g.accuracy_score,
        fluency: acc.fluency + g.fluency_score,
      }),
      { accuracy: 0, fluency: 0 }
    );
    return {
      accuracy: (totals.accuracy / grades.length).toFixed(1),
      fluency: (totals.fluency / grades.length).toFixed(1),
    };
  };

  if (loading) return <div className="loading">Loading...</div>;

  const averages = calculateAverages();

  return (
    <div className="grade-history">
      <h1>Grade History</h1>

      {error && <div className="error-message">{error}</div>}

      {grades.length > 0 && (
        <div className="averages-card">
          <h2>Overall Performance</h2>
          <div className="averages">
            <div className="average-item">
              <span className="average-label">Avg. Accuracy:</span>
              <span className="average-value">{averages.accuracy}/10</span>
            </div>
            <div className="average-item">
              <span className="average-label">Avg. Fluency:</span>
              <span className="average-value">{averages.fluency}/10</span>
            </div>
            <div className="average-item">
              <span className="average-label">Total Attempts:</span>
              <span className="average-value">{grades.length}</span>
            </div>
          </div>
        </div>
      )}

      {grades.length === 0 ? (
        <div className="empty-state">
          <p>No grades yet. Complete some practice sessions to see your history!</p>
        </div>
      ) : (
        <table className="grades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Text</th>
              <th>Week</th>
              <th>Accuracy</th>
              <th>Fluency</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td>{new Date(grade.created_at).toLocaleDateString()}</td>
                <td>{grade.text_title}</td>
                <td>{grade.week_number}</td>
                <td className="score-cell">{grade.accuracy_score}/10</td>
                <td className="score-cell">{grade.fluency_score}/10</td>
                <td className="feedback-cell">{grade.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
