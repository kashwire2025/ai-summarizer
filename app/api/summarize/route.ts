import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
];

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: "You are a precise document summarizer. Output only the requested summary without internal reasoning logs."
        });

        const result = await model.generateContent(text);
        const summary = result.response.text();

        return NextResponse.json({ 
          summary, 
          modelUsed: modelName 
        });

      } catch (err: any) {
        console.warn(`Model ${modelName} failed (${err?.message}). Switching to fallback...`);
        lastError = err;
      }
    }

    return NextResponse.json(
      { error: `All model fallbacks failed. Last error: ${lastError?.message}` },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
