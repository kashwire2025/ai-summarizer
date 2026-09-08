import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `
You are the AI Document Workbench assistant. Your primary task is to analyze, summarize, and extract insights from documents and user queries.

STRICT OUTPUT RULES:
1. Provide clean, professional response text without raw markdown symbols where possible.
2. DO NOT use LaTeX math syntax ($\text{...}$). Write formulas in plain text (e.g., PM2.5, SO2).
3. DO NOT use Markdown pipe tables (| Col | Col |). Format structured data using bullet points.
4. DO NOT use ASCII art, character borders (%, =, -, #), or HTML tags (<br>).
5. DO NOT output code snippets for file generation.
6. Respond in the requested target language/locale (Language Code/Context: ${language || "en"}).
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

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
    let responseText = result.response.text();

    // Clean up LaTeX, HTML, and repetitive borders
    responseText = responseText.replace(/\$\\text\{([^}]+)\}_\{?([^}$]+)\}?\$/g, "$1$2");
    responseText = responseText.replace(/\$\\text\{([^}]+)\}\$/g, "$1");
    responseText = responseText.replace(/\$([^$]+)\$/g, "$1");
    responseText = responseText.replace(/<br\s*\/?>/gi, " ");
    responseText = responseText.replace(/^\|?\s*:?-+:?\s*\|.*$/gm, "");
    responseText = responseText.replace(/[%=\-#*|]{4,}/g, "");

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate summary." },
      { status: 500 }
    );
  }
}
