import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Priority list of models to try if the primary endpoint is overloaded
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.5-pro",
];

async function generateWithRetry(genAI: any, modelName: string, prompt: string, maxRetries = 2) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (err: any) {
      const is503 =
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("overloaded");

      if (is503 && attempt < maxRetries) {
        // Wait with jitter before retrying same model
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 500));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { text, promptType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `${promptType || "Summarize this"}:\n\n${text}`;
    let lastError: string = "";

    // Loop through model chain
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const responseText = await generateWithRetry(genAI, modelName, prompt);
        if (responseText) {
          return NextResponse.json({ summary: responseText });
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${modelName} failed/overloaded:`, lastError);
      }
    }

    return NextResponse.json(
      { error: "Servers are currently experiencing heavy traffic. Please try again in a few seconds." },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
