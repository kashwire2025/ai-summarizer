import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const { text, fileData, promptType, language } = await req.json();

    // Explicitly target the stable v1 API version to fix 404 routing errors
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: "v1" }
    );

    const systemInstruction = `You are an interactive AI web assistant and document analyzer. 
Answer questions, follow instructions, engage in natural conversation, and analyze uploaded content.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Context/Task: ${promptType || 'General Chat'}`;

    const promptText = `${systemInstruction}\n\nUser Input / Document:\n${text || "Hello"}`;

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
