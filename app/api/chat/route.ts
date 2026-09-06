import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
];

export async function POST(req: Request) {
  try {
    const { history, message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const formattedHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    let lastError: any = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: "You are an intelligent, helpful AI collaborator. Respond conversationally, clearly, and concisely, maintaining context from earlier in the chat."
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({
          reply: responseText,
          modelUsed: modelName
        });

      } catch (err: any) {
        console.warn(`Chat failed on ${modelName}: ${err?.message}`);
        lastError = err;
      }
    }

    return NextResponse.json(
      { error: `All model fallbacks failed: ${lastError?.message}` },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
