import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const MODEL_NAME = 'gemini-3.6-flash';

async function generateWithRetry(prompt: string, imageBase64?: string, history: any[] = []) {
  let lastError: any = null;

  // Retry up to 3 times on 503/429 transient server issues
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
      lastError = err;
      const msg = String(err?.message || err);
      if (msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
        await new Promise(res => setTimeout(res, 1200 * (attempt + 1)));
      } else {
        throw err;
      }
    }
  }

  throw lastError || new Error('Service overloaded after retries.');
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
