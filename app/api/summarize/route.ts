import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Supported active model endpoints
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function generateWithRetry(prompt: string, imageBase64?: string, history: any[] = []) {
  const errors: string[] = [];

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const contents: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        contents.push(...history);
      }

      const parts: any[] = [];
      if (prompt) {
        parts.push({ text: prompt });
      }

      if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const mimeMatch = imageBase64.match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      contents.push({ role: 'user', parts });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
      if (text) {
        return text;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      errors.push(`${modelName}: ${msg}`);
      await new Promise(res => setTimeout(res, 500));
    }
  }

  throw new Error(`Model execution failed across endpoints:\n${errors.join('\n')}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, image, history } = body;

    if (!prompt && !image) {
      return NextResponse.json({ error: 'Prompt or image is required.' }, { status: 400 });
    }

    const textResult = await generateWithRetry(prompt || 'Summarize this content.', image, history);
    return NextResponse.json({ result: textResult });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Service temporarily unavailable.' },
      { status: 500 }
    );
  }
}
