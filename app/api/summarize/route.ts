import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
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

    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `You are an interactive conversational AI document analyzer and web workbench.
You maintain continuous dialogue, answer follow-up queries, and analyze documents.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Task Context: ${promptType || 'General Conversation'}`;

    let promptText = `${systemInstruction}\n\n`;

    if (Array.isArray(history) && history.length > 0) {
      promptText += `--- Conversation History ---\n`;
      history.slice(-8).forEach((msg: { role: string; content: string }) => {
        promptText += `${msg.role === "user" ? "User" : "AI"}: ${msg.content}\n`;
      });
      promptText += `--- End History ---\n\n`;
    }

    promptText += `New User Command / Input:\n${text || "Process request"}`;

    let contents: any[] = [promptText];
    if (fileData && fileData.inlineData) {
      contents.push(fileData);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let responseText = "";
    let modelUsed = "";
    let lastError: any = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(contents);
        responseText = result.response.text();
        if (responseText) {
          modelUsed = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!responseText) {
      return NextResponse.json(
        { error: `Model call failed. Last error: ${lastError?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: responseText, modelUsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
