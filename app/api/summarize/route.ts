import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `
You are the AI Document Workbench assistant. Your primary task is to analyze, summarize, and extract insights from documents and user queries.

STRICT FORMATTING RULES:
1. Provide clean, professional markdown outputs.
2. ABSOLUTELY NO LATEX: Do NOT use LaTeX math formulas or LaTeX syntax like $\\text{...}$. Write chemical formulas, numbers, and variables in plain text (e.g., PM2.5 instead of $\\text{PM}_{2.5}$, SO2 instead of $\\text{SO}_2$).
3. ABSOLUTELY NO HTML TAGS: Do NOT output HTML tags anywhere in your response (e.g., do NOT write <br>, <div>, or <span>). Use standard markdown line breaks and bullet points.
4. NO ASCII DRAWINGS: Do NOT output ASCII art, character-based box diagrams, or border strings made of %, =, -, #, or |.
5. FOR TABLES & LISTS: Use clean markdown bullet points or standard Markdown tables without HTML tags inside cells.
6. NO CODE GENERATION FOR FILES: Do NOT output Python, ReportLab scripts, or PDF creation code.
7. Respond in the requested target language/locale (Language Code/Context: ${language || "en"}).
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

    // Sanitizer 1: Strip LaTeX \text{...} wrappers to plain text
    responseText = responseText.replace(/\$\\text\{([^}]+)\}_\{?([^}$]+)\}?\$/g, "$1$2");
    responseText = responseText.replace(/\$\\text\{([^}]+)\}\$/g, "$1");
    responseText = responseText.replace(/\$([^$]+)\$/g, "$1");

    // Sanitizer 2: Convert literal <br> tags into clean spaces/newlines
    responseText = responseText.replace(/<br\s*\/?>/gi, " ");

    // Sanitizer 3: Remove repetitive ASCII border lines
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
