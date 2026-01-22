import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        // Get all grades with associated text info for history view
        const result = await sql`
          SELECT g.*, r.transcribed_text, r.text_id, t.title as text_title, t.week_number
          FROM grades g
          JOIN recordings r ON g.recording_id = r.id
          JOIN texts t ON r.text_id = t.id
          ORDER BY g.created_at DESC
        `;

        return res.status(200).json({ success: true, grades: result.rows });
      }

      case 'POST': {
        const { recording_id, fluency_score, accuracy_score, feedback } = req.body;

        if (!recording_id || fluency_score === undefined || accuracy_score === undefined) {
          return res.status(400).json({ success: false, error: 'recording_id, fluency_score, and accuracy_score are required' });
        }

        const result = await sql`
          INSERT INTO grades (recording_id, fluency_score, accuracy_score, feedback)
          VALUES (${Number(recording_id)}, ${Number(fluency_score)}, ${Number(accuracy_score)}, ${feedback || ''})
          RETURNING *
        `;

        return res.status(201).json({ success: true, grade: result.rows[0] });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Grades API error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
