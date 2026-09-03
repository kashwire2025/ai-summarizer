import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const contentParts: any[] = [];

    const finalPrompt = (prompt && prompt.trim() !== '')
      ? prompt
      : 'Please analyze and summarize this document or image.';
    contentParts.push({ type: 'text', text: finalPrompt });

    if (image) {
      const base64Data = typeof image === 'string' && image.includes(',')
        ? image.split(',')[1]
        : image;
      
      contentParts.push({
        type: 'image',
        image: Buffer.from(base64Data, 'base64'),
      });
    }

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer. Output the summary in ${language}. Format requirement: ${length}.`,
      messages: [{ role: 'user', content: contentParts }],
    });

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Summarize API Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to generate summary' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
