import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    
    // Updated model as indicated by the API response
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const systemPrompt = `You are an AI Document Workbench assistant. Respond strictly in ${language}.\n\nUser request: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
