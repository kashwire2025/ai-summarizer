import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Valid Gemini production model identifiers
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash"
];

export async function POST(req: Request) {
  try {
    const { text, promptType, language } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text content is required." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const prompt = `You are a professional document analysis assistant. Provide a clear, well-structured ${promptType || "summary"} in ${language || "English"} for the following content:\n\n${text}`;

    let lastError = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (responseText) {
          return NextResponse.json({ summary: responseText });
        }
      } catch (err: any) {
        console.error(`Failed request for model ${modelName}:`, err.message);
        lastError = err;
      }
    }

    return NextResponse.json(
      { error: `All model fallbacks failed. Last error: ${lastError?.message || "Unknown API Error"}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
