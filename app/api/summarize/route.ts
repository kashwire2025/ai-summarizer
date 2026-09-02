import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response('GROQ_API_KEY is missing in Vercel Environment Variables.', { status: 500 });
  }

  try {
    const { prompt, length = 'bullets', image } = await req.json();

    let lengthInstruction = 'Summarize into clean, scannable bullet points highlighting key insights.';
    if (length === 'brief') {
      lengthInstruction = 'Provide a concise 2-to-3 sentence executive brief.';
    } else if (length === 'detailed') {
      lengthInstruction = 'Provide an executive summary followed by a comprehensive section breakdown.';
    }

    const activeModel = 'openai/gpt-oss-20b';

    const userContent = image 
      ? `Extract all text from this document image and summarize it immediately. Instruction: ${lengthInstruction}\n\n[IMAGE DATA: ${image}]`
      : `Instruction: ${lengthInstruction}\n\nDocument Content:\n${prompt}`;

    const result = streamText({
      model: groq(activeModel),
      system: 'You are a direct text summarizer. Do not ask for more input. Do not say "I am ready". Output ONLY the summary immediately.',
      prompt: userContent,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(err?.message || 'Server processing failed', { status: 500 });
  }
}
