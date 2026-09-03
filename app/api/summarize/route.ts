import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Fallback order if primary model hits high traffic (503)
const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

async function generateWithRetry(prompt: string, imageBase64?: string, history: any[] = []) {
  let lastError: any = null;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeAIModel({ model: modelName });

        const contents: any[] = [];
        if (history && history.length > 0) {
          contents.push(...history);
        }

        const parts: any[] = [{ text: prompt }];
        if (imageBase64) {
          const base64Data = imageBase64.split(',')[1] || imageBase64;
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
        return response.text();
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        if (errStr.includes('503') || errStr.includes('429') || errStr.includes('UNAVAILABLE')) {
          await new Promise(res => setTimeout(res, 1200 * (attempt + 1)));
        } else {
          break;
        }
      }
    }
  }
  throw lastError || new Error('All model endpoints are currently overloaded. Please retry in a few seconds.');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, image, history } = body;

    if (!prompt && !image) {
      return NextResponse.json({ error: 'Prompt or image is required.' }, { status: 400 });
    }

    const textResult = await generateWithRetry(prompt, image, history);
    return NextResponse.json({ result: textResult });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Service temporarily unavailable.' },
      { status: 500 }
    );
  }
}
