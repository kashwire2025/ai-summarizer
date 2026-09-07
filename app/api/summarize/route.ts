import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Valid Gemini models
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

async function generateWithRetry(genAI: any, modelName: string, contents: any[], maxRetries = 2) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return await result.response.text();
    } catch (err: any) {
      const isTransient =
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("overloaded");

      if (isTransient && attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delay + Math.random() * 500));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { text, fileData, promptType } = await req.json();

    if (!text && !fileData) {
      return NextResponse.json({ error: "No input text or file provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = promptType && promptType !== "General Chat"
      ? `Perform document analysis (${promptType}) on the provided input:`
      : `You are a helpful AI assistant. Analyze or answer questions regarding the provided input:`;

    const contents: any[] = [systemInstruction];

    if (fileData?.inlineData?.data) {
      contents.push({
        inlineData: {
          data: fileData.inlineData.data,
          mimeType: fileData.inlineData.mimeType || "application/pdf",
        },
      });
    }

    if (text && !text.startsWith("[Attached File:")) {
      contents.push(text);
    }

    let lastError = "";
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const responseText = await generateWithRetry(genAI, modelName, contents);
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
