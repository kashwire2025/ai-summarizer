import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.5-pro",
];

async function generateWithRetry(genAI: any, modelName: string, contents: any[], maxRetries = 2) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return await result.response.text();
    } catch (err: any) {
      const is503 = err?.status === 503 || err?.message?.includes("503") || err?.message?.includes("high demand");
      if (is503 && attempt < maxRetries) {
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
      return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = promptType && promptType !== "General Chat"
      ? `Perform document analysis (${promptType}) on the input provided:`
      : `You are a helpful AI assistant. Analyze or answer questions regarding the provided input:`;

    // Construct prompt payload (supports text + binary base64 attachments)
    const contents: any[] = [systemInstruction];
    if (fileData?.inlineData) {
      contents.push({ inlineData: fileData.inlineData });
    }
    if (text) {
      contents.push(text);
    }

    let lastError = "";
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const responseText = await generateWithRetry(genAI, modelName, contents);
        if (responseText) return NextResponse.json({ summary: responseText });
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    return NextResponse.json({ error: "Servers busy. Retry shortly." }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
