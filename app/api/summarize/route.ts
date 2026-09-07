import { NextResponse } from "next/server";

// Active Gemini model fallback chain
const API_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

export async function POST(req: Request) {
  try {
    const { text, fileData, promptType, language } = await req.json();

    if (!text && !fileData) {
      return NextResponse.json({ error: "No input text or file provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY missing. Please configure GEMINI_API_KEY under Vercel Project Settings." 
      }, { status: 500 });
    }

    const targetLang = language || "English";
    const promptHeader = `[Instruction: Respond exclusively in ${targetLang}. ${promptType && promptType !== "General Chat" ? `Perform analysis: ${promptType}` : "Analyze and answer directly"}]`;

    const parts: any[] = [];

    if (fileData?.inlineData?.data) {
      parts.push({
        inline_data: {
          mime_type: fileData.inlineData.mimeType || "application/pdf",
          data: fileData.inlineData.data,
        },
      });
    }

    if (text) {
      parts.push({ text: `${promptHeader}\n\n${text}` });
    } else {
      parts.push({ text: promptHeader });
    }

    let lastError = "";

    for (const model of API_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
          }),
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ summary: data.candidates[0].content.parts[0].text });
        } else if (data.error?.message) {
          lastError = data.error.message;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return NextResponse.json({ error: `API Error: ${lastError || "Failed to generate response"}` }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
