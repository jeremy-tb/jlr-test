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
    const { originalText, transcribedText } = req.body;

    if (!originalText || !transcribedText) {
      return res.status(400).json({ success: false, error: 'Both originalText and transcribedText are required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a Mandarin Chinese language teacher grading a student's reading practice. Compare the student's spoken transcription against the original text.

Original Text:
${originalText}

Student's Transcription (from their spoken reading):
${transcribedText}

Please evaluate and provide:
1. Accuracy Score (1-10): How accurately did they read the text? Consider character recognition, tones implied by context, and completeness.
2. Fluency Score (1-10): Based on the transcription, estimate their fluency. Consider natural phrasing, completeness of sentences, and whether they captured the full meaning.
3. Feedback: Provide specific, constructive feedback in 2-3 sentences. Note any missed characters, mispronunciations that might be inferred, or areas for improvement.

Respond in this exact JSON format:
{
  "accuracyScore": <number>,
  "fluencyScore": <number>,
  "feedback": "<string>"
}`,
        },
      ],
    });

    const textContent = message.content.find(c => c.type === 'text');
    const responseText = textContent ? textContent.text : '{}';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const gradeResult = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      fluencyScore: gradeResult.fluencyScore,
      accuracyScore: gradeResult.accuracyScore,
      feedback: gradeResult.feedback,
    });
  } catch (error) {
    console.error('Grading error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
