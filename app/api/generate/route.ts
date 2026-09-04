import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Active models ordered by priority fallback
const MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash'
];

export async function POST(req: Request) {
  try {
    const { prompt, language = 'English' } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = `You are an AI Document Workbench assistant. Respond strictly in ${language}.\n\nUser request: ${prompt}`;

    let responseText = null;
    let lastError = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        responseText = result.response.text();
        
        if (responseText) {
          console.log(`Success using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, falling back to next model:`, err.message);
        lastError = err;
      }
    }

    if (responseText) {
      return NextResponse.json({ text: responseText });
    }

    return NextResponse.json(
      { error: lastError?.message || 'All AI models failed to respond.' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
