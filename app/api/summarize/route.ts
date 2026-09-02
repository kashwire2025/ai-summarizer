import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key missing' }), { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const contentParts: any[] = [];

    // CRITICAL FIX 1: Gemini strictly requires text. We now guarantee a prompt is ALWAYS sent, even if the user's text box is empty.
    const finalPrompt = (prompt && prompt.trim() !== '') 
      ? prompt 
      : 'Please thoroughly analyze and summarize this uploaded document.';
    
    contentParts.push({ type: 'text', text: finalPrompt });

    // CRITICAL FIX 2: Clean base64 extraction
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      contentParts.push({ type: 'image', image: base64Data });
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer. Output the summary in ${language}. Format requirement: ${length}.`,
      messages: [{ role: 'user', content: contentParts }],
    });

    // CRITICAL FIX 3: Output raw text stream to prevent frontend parsing crashes
    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
