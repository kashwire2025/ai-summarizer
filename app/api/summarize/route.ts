import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return new Response('API key missing', { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const finalPrompt = prompt?.trim() ? prompt : `Summarize this document in ${language}. Format: ${length}.`;
    const contentParts: any[] = [finalPrompt];

    if (image) {
      let base64Data = image;
      let mimeType = 'image/jpeg';
      // Safely extract raw base64 if a data URL is sent
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) { 
          mimeType = matches[1]; 
          base64Data = matches[2]; 
        }
      }
      contentParts.push({ inlineData: { data: base64Data, mimeType } });
    }

    const result = await model.generateContentStream(contentParts);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            if (chunk.text()) controller.enqueue(encoder.encode(chunk.text()));
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`\n[Stream Error: ${err.message}]`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
