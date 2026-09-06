import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Stable production models
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export async function POST(req: Request) {
  try {
    const { text, promptType, language } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text content is required." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables in Vercel." },
        { status: 500 }
      );
    }

    const prompt = `You are a professional document analysis assistant. Provide a clear, well-structured ${promptType || "summary"} in ${language || "English"} for the following content:\n\n${text}`;

    const errorDetails: string[] = [];

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
        errorDetails.push(`[${modelName}]: ${err.message}`);
      }
    }

    return NextResponse.json(
      { error: `All model attempts failed: ${errorDetails.join(" | ")}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
