import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const textToSummarize = body.text || body.prompt || body.content || body.document;

    if (!textToSummarize || typeof textToSummarize !== "string" || !textToSummarize.trim()) {
      return NextResponse.json(
        { error: "No document text provided. Please enter text to summarize." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key in environment variables" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: "You are a precise document summarizer. Output only the requested summary without internal reasoning logs."
        });

        const result = await model.generateContent(textToSummarize.trim());
        const summary = result.response.text();

        return NextResponse.json({ 
          summary, 
          result: summary,
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
