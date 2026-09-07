import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text, fileData, promptType, language } = await req.json();

    // Use active stable model endpoint
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
