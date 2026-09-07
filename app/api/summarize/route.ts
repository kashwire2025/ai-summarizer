import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MODELS = ["gemini-3.6-flash"];

export async function POST(req: Request) {
  try {
    const { text, promptType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
          `${promptType || "Summarize this"}:\n\n${text}`
        );
        const responseText = await result.response.text();
        return NextResponse.json({ summary: responseText });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${modelName} failed:`, lastError);
      }
    }

    return NextResponse.json(
      { error: `Gemini Error: ${lastError}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
