import { NextResponse } from "next/server";

// Fallback model chain ensuring standard Google API compatibility
const API_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
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
        error: "GEMINI_API_KEY environment variable is missing. Please add GEMINI_API_KEY in Vercel Project Settings -> Environment Variables." 
      }, { status: 500 });
    }

    const targetLang = language || "English";
    const promptHeader = `[Instruction: Respond in ${targetLang}. ${promptType && promptType !== "General Chat" ? `Perform analysis: ${promptType}` : "Analyze and answer concisely"}]`;

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

    // Standard Direct REST payload call prevents SDK model path mismatch errors
    for (const model of API_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: parts,
              },
            ],
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

    return NextResponse.json({ error: `API Error: ${lastError || "All models failed to respond"}` }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
