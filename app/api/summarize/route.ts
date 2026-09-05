import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, text, action, language } = await req.json();
    const inputContent = prompt || text;

    if (!inputContent) {
      return NextResponse.json({ error: "Prompt or text is required." }, { status: 400 });
    }

    const targetLanguage = language || "English";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const systemPrompt = `You are an expert document analysis AI.
CRITICAL MANDATE: You MUST provide your entire output strictly in ${targetLanguage}.
Do not write in English unless ${targetLanguage} is English.
Perform the following analysis task: ${action || "execSummary"}.`;

    const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-exp"];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nDocument Text:\n${inputContent}` }],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (response.ok && resultText) {
          return NextResponse.json({ result: resultText, modelUsed: model });
        } else {
          lastError = data?.error?.message || `Model ${model} failed.`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json({ error: `All 3 models failed. Last error: ${lastError}` }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
