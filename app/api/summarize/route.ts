import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are an expert document summarizer. Provide clear, well-structured summaries using bullet points and bold key takeaways.',
    prompt,
  });

  return result.toDataStreamResponse();
}
