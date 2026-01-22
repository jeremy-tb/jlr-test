import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    // Determine media type from base64 header or default to jpeg
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    let base64Data = imageBase64;

    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mediaType = match[1] as typeof mediaType;
        base64Data = match[2];
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'Please extract and transcribe all the text from this image. If the text is in Mandarin Chinese, preserve the original Chinese characters. Output only the transcribed text, nothing else.',
            },
          ],
        },
      ],
    });

    const textContent = message.content.find(c => c.type === 'text');
    const extractedText = textContent ? textContent.text : '';

    return res.status(200).json({ success: true, text: extractedText });
  } catch (error) {
    console.error('OCR error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
