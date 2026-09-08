import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `
You are the AI Document Workbench assistant. Your primary task is to analyze, summarize, and extract insights from documents and user queries.

STRICT FORMATTING RULES FOR PDF COMPATIBILITY:
1. Provide clean, professional markdown outputs using standard headers (##, ###) and bullet points.
2. ABSOLUTELY NO MARKDOWN TABLES / PIPE SYNTAX: Do NOT use pipe table syntax (e.g. | Col 1 | Col 2 | or |:---|:---|). The PDF export engine cannot parse table pipes. Format all comparisons, matrices, and tabular data using structured bold bullet lists instead.
3. ABSOLUTELY NO LATEX: Write all chemical terms, math, and variables in plain text (e.g., PM2.5, SO2, Sodium-ion). Never use $ or \\text{...}.
4. ABSOLUTELY NO HTML TAGS OR ASCII ART: Do NOT output HTML tags (<br>, <div>) or ASCII box drawings (%, =, -, # borders).
5. NO CODE GENERATION FOR FILES: Do NOT output Python, ReportLab scripts, or PDF creation code.
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

    // Sanitizer 1: Strip LaTeX \text{...} wrappers
    responseText = responseText.replace(/\$\\text\{([^}]+)\}_\{?([^}$]+)\}?\$/g, "$1$2");
    responseText = responseText.replace(/\$\\text\{([^}]+)\}\$/g, "$1");
    responseText = responseText.replace(/\$([^$]+)\$/g, "$1");

    // Sanitizer 2: Convert literal <br> tags to spaces
    responseText = responseText.replace(/<br\s*\/?>/gi, " ");

    // Sanitizer 3: Remove markdown table syntax lines like |:---|:---|
    responseText = responseText.replace(/^\|?\s*:?-+:?\s*\|.*$/gm, "");

    // Sanitizer 4: Remove repetitive ASCII border lines
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
