import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response('GEMINI_API_KEY is missing in Vercel Environment Variables.', { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt = '', length = 'bullets', image, language = 'en' } = body;

    let lengthInstruction = 'Summarize into clean, scannable bullet points highlighting key insights.';
    if (length === 'brief') {
      lengthInstruction = 'Provide a concise 2-to-3 sentence executive brief.';
    } else if (length === 'detailed') {
      lengthInstruction = 'Provide an executive summary followed by a comprehensive section breakdown.';
    }

    const contentParts: any[] = [];
    
    const userPrompt = prompt && prompt.trim() !== '' 
      ? prompt 
      : 'Please extract all text from this image and provide a comprehensive summary.';
    
    contentParts.push({ type: 'text', text: userPrompt });

    if (image) {
      // Clean up base64 prefix if present
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      contentParts.push({ 
        type: 'image', 
        image: base64Data 
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer and multilingual translator. Analyze the provided text or image carefully, and output the summary entirely in the requested target language code (${language}). Format requirement: ${lengthInstruction}`,
      messages: [
        {
          role: 'user',
          content: contentParts,
        },
      ],
    });

    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error('Summarize API Error:', err);
    return new Response(`AI Generation Error: ${err?.message || JSON.stringify(err)}`, { status: 500 });
  }
}
