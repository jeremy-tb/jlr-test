import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const { id } = req.query;

        if (id) {
          // Get single text with recordings and grades
          const textResult = await sql`SELECT * FROM texts WHERE id = ${Number(id)}`;
          if (textResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Text not found' });
          }

          const recordingsResult = await sql`
            SELECT r.*, g.id as grade_id, g.fluency_score, g.accuracy_score, g.feedback, g.created_at as grade_created_at
            FROM recordings r
            LEFT JOIN grades g ON r.id = g.recording_id
            WHERE r.text_id = ${Number(id)}
            ORDER BY r.created_at DESC
          `;

          const text = textResult.rows[0];
          const recordings = recordingsResult.rows.map(row => ({
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

          return res.status(200).json({ success: true, text: { ...text, recordings } });
        } else {
          // Get all texts
          const result = await sql`SELECT * FROM texts ORDER BY week_number DESC, created_at DESC`;
          return res.status(200).json({ success: true, texts: result.rows });
        }
      }

      case 'POST': {
        const { title, original_text, week_number } = req.body;

        if (!title || !original_text || week_number === undefined) {
          return res.status(400).json({ success: false, error: 'title, original_text, and week_number are required' });
        }

        const result = await sql`
          INSERT INTO texts (title, original_text, week_number)
          VALUES (${title}, ${original_text}, ${Number(week_number)})
          RETURNING *
        `;

        return res.status(201).json({ success: true, text: result.rows[0] });
      }

      case 'PUT': {
        const { id, title, original_text, week_number } = req.body;

        if (!id) {
          return res.status(400).json({ success: false, error: 'id is required' });
        }

        const result = await sql`
          UPDATE texts
          SET title = COALESCE(${title}, title),
              original_text = COALESCE(${original_text}, original_text),
              week_number = COALESCE(${week_number ? Number(week_number) : null}, week_number)
          WHERE id = ${Number(id)}
          RETURNING *
        `;

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Text not found' });
        }

        return res.status(200).json({ success: true, text: result.rows[0] });
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ success: false, error: 'id is required' });
        }

        await sql`DELETE FROM texts WHERE id = ${Number(id)}`;
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Texts API error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
