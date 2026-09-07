import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in Vercel. Add it under Vercel Settings > Environment Variables." },
        { status: 500 }
      );
    }

    const { text, fileData, promptType, language } = await req.json();

    // Directly call the official gemini-3.6-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const systemInstruction = `You are an interactive conversational AI web assistant and document workbench.
You respond comprehensively to every question, command, document analysis, and chat prompt like a web AI.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Task Context: ${promptType || 'General Chat'}`;

    const promptText = `${systemInstruction}\n\nUser Input / Request:\n${text || "Hello"}`;

    let contents: any[] = [promptText];
    if (fileData && fileData.inlineData) {
      contents.push(fileData);
    }

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText, modelUsed: "gemini-3.6-flash" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}
