import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Active Gemini model fallbacks
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro"
];

export async function POST(req: Request) {
  try {
    const { text, promptType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    let lastError = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`${promptType || "Summarize this"}:\n\n${text}`);
        const responseText = await result.response.text();
        
        return NextResponse.json({ summary: responseText });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${modelName} failed:`, lastError);
      }
    }

    return NextResponse.json(
      { error: `All model attempts failed. Last error: ${lastError}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
