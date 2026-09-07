import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text, fileData, promptType, language } = await req.json();

    // Configured to gemini-1.5-pro for maximum reasoning performance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemInstruction = `You are an interactive AI web assistant and document analyzer. 
You answer questions, execute instructions, engage in natural chat, and analyze documents.
CRITICAL MANDATE: You MUST respond ENTIRELY in the following language: "${language || 'English'}".
Task/Prompt Context: ${promptType || 'General Chat'}`;

    const promptText = `${systemInstruction}\n\nUser Input / Document Text:\n${text || "Hello"}`;

    let contents: any[] = [promptText];
    if (fileData && fileData.inlineData) {
      contents.push(fileData);
    }

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}
