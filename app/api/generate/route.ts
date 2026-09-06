import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

export async function POST(req: Request) {
  try {
    const { prompt, text } = await req.json();
    const inputContent = prompt || text;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    if (!inputContent) {
      return NextResponse.json({ error: "Prompt or text is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(inputContent);
        const output = result.response.text();

        return NextResponse.json({ 
          result: output, 
          modelUsed: modelName 
        });
      } catch (err: any) {
        console.warn(`Model ${modelName} failed in /api/generate (${err?.message}). Switching to fallback...`);
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
