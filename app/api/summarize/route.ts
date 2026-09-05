import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt, action, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `You are an expert AI summarizer and content analyst. Respond in ${language || "English"}.`;
    let userPrompt = prompt;

    if (action === "execSummary") {
      userPrompt = `Provide a thorough executive summary of the following text:\n\n${prompt}`;
    } else if (action === "actionItems") {
      userPrompt = `Extract clear, bulleted key action items from the following text:\n\n${prompt}`;
    } else if (action === "takeaways") {
      userPrompt = `Extract the top strategic takeaways and insights from the following text:\n\n${prompt}`;
    } else if (action === "analyzeTrends") {
      userPrompt = `Analyze the trends, data points, and patterns in the following text:\n\n${prompt}`;
    }

    // Using the stable current model identifier
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const resultText = response.text || "No response generated.";

    return NextResponse.json({ result: resultText });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
