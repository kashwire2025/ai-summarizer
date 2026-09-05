import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt, action, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `You are an expert AI summarizer. Respond in ${language || "English"}.`;
    let userPrompt = prompt;

    if (action === "execSummary") {
      userPrompt = `Provide a thorough executive summary of the following text:\n\n${prompt}`;
    } else if (action === "actionItems") {
      userPrompt = `Extract clear, bulleted key action items from the following text:\n\n${prompt}`;
    } else if (action === "takeaways") {
      userPrompt = `Extract top strategic takeaways from the following text:\n\n${prompt}`;
    } else if (action === "analyzeTrends") {
      userPrompt = `Analyze key trends and data points in the following text:\n\n${prompt}`;
    }

    // Array of standard model identifiers to iterate through in case one is restricted
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let resultText = "";
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        if (response.text) {
          resultText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err.message || "Model request failed";
      }
    }

    if (!resultText) {
      return NextResponse.json(
        { error: `API Call Failed: ${lastError}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: resultText });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
