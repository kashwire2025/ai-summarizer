import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `
You are the AI Document Workbench assistant. Your primary task is to analyze, summarize, and extract insights from documents and user queries.

STRICT GUIDELINES:
1. Provide clean, professional, and well-structured markdown outputs.
2. CRITICAL: NEVER output Python code, ReportLab scripts, code snippets for file generation, or browser printing instructions (e.g., "Ctrl + P" or "Save as PDF"), even if the user explicitly asks to "generate a PDF file". The frontend workbench handles client-side PDF synthesis automatically.
3. Keep the content focused entirely on the requested analysis, summary, executive summary, key actions, or topic discussion.
4. Respond in the requested target language/locale (Language Code/Context: ${language || "en"}).
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

    // Format chat history into Gemini contents format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const contents: any[] = [...formattedHistory];

    const currentMessageParts: any[] = [];
    if (fileData) {
      currentMessageParts.push(fileData);
    }
    
    const userPrompt = text || promptType || "Please summarize the provided context.";
    currentMessageParts.push({ text: userPrompt });

    contents.push({
      role: "user",
      parts: currentMessageParts,
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate summary." },
      { status: 500 }
    );
  }
}
