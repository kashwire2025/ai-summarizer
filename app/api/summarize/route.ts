import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response('GROQ_API_KEY is missing in Vercel Environment Variables.', { status: 500 });
  }

  try {
    const { prompt, length = 'bullets', image } = await req.json();

    let systemPrompt = 'You are an expert document reader and summarizer.';
    if (length === 'bullets') {
      systemPrompt = 'Summarize into clean, scannable bullet points highlighting key insights.';
    } else if (length === 'brief') {
      systemPrompt = 'Provide a concise 2-to-3 sentence executive brief.';
    } else if (length === 'detailed') {
      systemPrompt = 'Provide an executive summary followed by a comprehensive section breakdown.';
    }

    if (image) {
      const result = streamText({
        model: groq('llama-3.2-11b-vision-preview'),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all readable text from this document image and summarize it.' },
              { type: 'image', image: image },
            ],
          },
        ],
      });
      return result.toTextStreamResponse();
    }

    if (!prompt || !prompt.trim()) {
      return new Response('Text prompt or camera image is required.', { status: 400 });
    }

    const result = streamText({
      model: groq('llama3-8b-8192'),
      system: systemPrompt,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(err?.message || 'Server processing failed', { status: 500 });
  }
}
