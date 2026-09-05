import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, action, language } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt or text is required." }, { status: 400 });
    }

    const targetLanguage = language || "English";

    // System instruction forcing output in target language
    const systemInstruction = `You are an expert AI document workbench assistant.
CRITICAL MANDATE: You MUST respond strictly in the following language: ${targetLanguage}.
Do not reply in English unless the requested language is English.
Analyze the user's input and perform the action "${action || "execSummary"}" fully written in ${targetLanguage}.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nUser Input:\n${prompt}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return NextResponse.json({ result: resultText });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
