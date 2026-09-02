import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response('GEMINI_API_KEY is missing in Vercel.', { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt = '', length = 'bullets', image, language = 'en' } = body;

    const contentParts: any[] = [];
    
    // Ensure we provide a valid prompt even if only an image is uploaded
    if (prompt.trim() !== '') {
      contentParts.push({ type: 'text', text: prompt });
    } else if (!image) {
      return new Response('Please provide either text or upload an image to summarize.', { status: 400 });
    } else {
      contentParts.push({ type: 'text', text: 'Extract and analyze all text from this image to provide a comprehensive summary.' });
    }

    // Safely parse the base64 image data
    if (image) {
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      contentParts.push({ type: 'image', image: base64Data });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer. Output the summary exclusively in language code (${language}). Length requirement: ${length}.`,
      messages: [{ role: 'user', content: contentParts }],
    });

    // Force strict streaming headers to bypass Vercel/Nginx buffering
    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    console.error('Summarize API Error:', err);
    return new Response(`AI Generation Error: ${err?.message || JSON.stringify(err)}`, { status: 500 });
  }
}
