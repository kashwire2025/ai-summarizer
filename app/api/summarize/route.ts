import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// CRITICAL: Forces Vercel to use Edge instead of Node.js, preventing dropped streams
export const runtime = 'edge'; 

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is missing' }), { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const contentParts: any[] = [];

    // Ensure text is always sent
    const finalPrompt = (prompt && prompt.trim() !== '') 
      ? prompt 
      : 'Please analyze and summarize this image.';
    contentParts.push({ type: 'text', text: finalPrompt });

    // The AI SDK handles data URLs natively. Pass the raw image directly.
    if (image) {
      contentParts.push({ type: 'image', image: image });
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer. Output the summary in ${language}. Format requirement: ${length}.`,
      messages: [{ role: 'user', content: contentParts }],
    });

    // Output formatted stream for the frontend parser
    return result.toDataStreamResponse();
    
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
