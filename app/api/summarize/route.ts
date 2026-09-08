import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { text, history, fileData, promptType, language } = await req.json();

    const systemInstruction = `
You are the AI Document Workbench assistant.

STRICT FORMATTING REQUIREMENTS:
1. DO NOT use Markdown symbols anywhere in your response. No asterisks (** or *), no header hashes (#, ##, ###), no underscores, and no horizontal rules (---).
2. Format titles and sections using clean line breaks and UPPERCASE text.
3. Present lists using simple numbers (1., 2., 3.) or bullet points with standard dashes (-).
4. ABSOLUTELY NO LATEX ($\text{...}$), HTML (<br>), OR PIPE TABLES (|).
5. Output clean, readable plain text suitable for standard display boxes.
6. Language: ${language || "en"}.
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

    // Regex Sanitizer: Strip residual markdown symbols
    responseText = responseText.replace(/^#{1,6}\s*/gm, "");
    responseText = responseText.replace(/\*\*(.*?)\*\*/g, "$1");
    responseText = responseText.replace(/\*(.*?)\*/g, "$1");
    responseText = responseText.replace(/^---$/gm, "");
    responseText = responseText.replace(/\$\\text\{([^}]+)\}\$/g, "$1");
    responseText = responseText.replace(/<br\s*\/?>/gi, " ");

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate summary." },
      { status: 500 }
    );
  }
}
