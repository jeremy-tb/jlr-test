import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const { text_id } = req.query;

        if (text_id) {
          const result = await sql`
            SELECT r.*, g.id as grade_id, g.fluency_score, g.accuracy_score, g.feedback, g.created_at as grade_created_at
            FROM recordings r
            LEFT JOIN grades g ON r.id = g.recording_id
            WHERE r.text_id = ${Number(text_id)}
            ORDER BY r.created_at DESC
          `;

          const recordings = result.rows.map(row => ({
            id: row.id,
            text_id: row.text_id,
            transcribed_text: row.transcribed_text,
            created_at: row.created_at,
            grade: row.grade_id ? {
              id: row.grade_id,
              recording_id: row.id,
              fluency_score: row.fluency_score,
              accuracy_score: row.accuracy_score,
              feedback: row.feedback,
              created_at: row.grade_created_at,
            } : undefined,
          }));

          return res.status(200).json({ success: true, recordings });
        } else {
          return res.status(400).json({ success: false, error: 'text_id is required' });
        }
      }

      case 'POST': {
        const { text_id, transcribed_text } = req.body;

        if (!text_id || !transcribed_text) {
          return res.status(400).json({ success: false, error: 'text_id and transcribed_text are required' });
        }

        const result = await sql`
          INSERT INTO recordings (text_id, transcribed_text)
          VALUES (${Number(text_id)}, ${transcribed_text})
          RETURNING *
        `;

        return res.status(201).json({ success: true, recording: result.rows[0] });
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ success: false, error: 'id is required' });
        }

        await sql`DELETE FROM recordings WHERE id = ${Number(id)}`;
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recordings API error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
