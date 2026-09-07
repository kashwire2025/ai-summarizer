import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
];

export async function POST(req: Request) {
  try {
    const { text, fileData, promptType, language } = await req.json();

    if (!text && !fileData) {
      return NextResponse.json({ error: "No input text or file provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const targetLang = language || "English";
    const promptHeader = `[Instruction: Please respond in ${targetLang}. ${promptType && promptType !== "General Chat" ? `Perform analysis: ${promptType}` : "Provide a clear and concise response"}]`;

    const promptParts: any[] = [];

    if (fileData?.inlineData?.data) {
      promptParts.push({
        inlineData: {
          data: fileData.inlineData.data,
          mimeType: fileData.inlineData.mimeType || "application/pdf",
        },
      });
    }

    if (text) {
      promptParts.push(`${promptHeader}\n\n${text}`);
    } else {
      promptParts.push(promptHeader);
    }

    let lastError = "";
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptParts);
        const responseText = await result.response.text();
        if (responseText) return NextResponse.json({ summary: responseText });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${modelName} failed:`, lastError);
      }
    }

    return NextResponse.json({ error: `API Error: ${lastError}` }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
