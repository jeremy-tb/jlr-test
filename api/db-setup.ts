import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create texts table
    await sql`
      CREATE TABLE IF NOT EXISTS texts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        original_text TEXT NOT NULL,
        week_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create recordings table
    await sql`
      CREATE TABLE IF NOT EXISTS recordings (
        id SERIAL PRIMARY KEY,
        text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
        transcribed_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create grades table
    await sql`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        recording_id INTEGER REFERENCES recordings(id) ON DELETE CASCADE,
        fluency_score INTEGER NOT NULL,
        accuracy_score INTEGER NOT NULL,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return res.status(200).json({ success: true, message: 'Database tables created successfully' });
  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
