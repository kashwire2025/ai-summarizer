import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response('GEMINI_API_KEY is missing in Vercel Environment Variables.', { status: 500 });
    }

    const { prompt, length = 'bullets', image, language = 'en' } = await req.json();

    let lengthInstruction = 'Summarize into clean, scannable bullet points highlighting key insights.';
    if (length === 'brief') {
      lengthInstruction = 'Provide a concise 2-to-3 sentence executive brief.';
    } else if (length === 'detailed') {
      lengthInstruction = 'Provide an executive summary followed by a comprehensive section breakdown.';
    }

    const messagesContent: any[] = [];
    
    if (prompt && prompt.trim() !== '') {
      messagesContent.push({ type: 'text', text: prompt });
    } else {
      messagesContent.push({ type: 'text', text: 'Please extract and summarize all text from this document image.' });
    }

    if (image) {
      messagesContent.push({ type: 'image', image: image });
    }

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert document summarizer and translator. Analyze the provided text or image, and output the summary entirely in the requested target language code (${language}). Format requirement: ${lengthInstruction}`,
      messages: [
        {
          role: 'user',
          content: messagesContent,
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('API Error details:', err);
    return new Response(err?.message || 'Internal Server Error', { status: 500 });
  }
}
