import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function POST(req: Request) {
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

    // Process camera snap via Groq Vision Model
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

      return typeof result.toDataStreamResponse === 'function'
        ? result.toDataStreamResponse()
        : result.toTextStreamResponse();
    }

    if (!prompt || !prompt.trim()) {
      return new Response('Text prompt or camera image is required.', { status: 400 });
    }

    // Process pasted text via Llama 3.3
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      prompt,
    });

    return typeof result.toDataStreamResponse === 'function'
      ? result.toDataStreamResponse()
      : result.toTextStreamResponse();
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(err?.message || 'Server processing failed', { status: 500 });
  }
}
