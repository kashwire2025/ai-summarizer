import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Self-healing fallback candidates ordered by preference
const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const { text, fileData, promptType, language } = await req.json();

    const systemInstruction = `You are an interactive AI web assistant and document analyzer. 
Answer questions, follow instructions, engage in natural conversation, and analyze uploaded content.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Context/Task: ${promptType || 'General Chat'}`;

    const promptText = `${systemInstruction}\n\nUser Input / Document:\n${text || "Hello"}`;

    let contents: any[] = [promptText];
    if (fileData && fileData.inlineData) {
      contents.push(fileData);
    }

    let lastError: any = null;

    // Iterate through available candidate endpoints until one succeeds
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(contents);
        const responseText = result.response.text();

        if (responseText) {
          return NextResponse.json({ summary: responseText, modelUsed: modelName });
        }
      } catch (err: any) {
        lastError = err;
        // Proceed to next model candidate if current one fails
      }
    }

    return NextResponse.json(
      { error: `API Key rejected all model candidates. Last error: ${lastError?.message || "Unknown error"}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}
