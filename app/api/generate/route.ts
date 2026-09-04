import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Priority order of models to attempt
const MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
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

    // Loop through available models in sequence
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        responseText = result.response.text();
        
        if (responseText) {
          break; // Successfully got response, exit retry loop
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or timed out:`, err.message);
        lastError = err;
        // Automatically continues to next model in MODELS array
      }
    }

    if (responseText) {
      return NextResponse.json({ text: responseText });
    }

    // If all models in the array failed
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
