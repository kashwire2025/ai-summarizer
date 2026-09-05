import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, action, language, fileText } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    // Combine uploaded document content with user prompt text
    let contextContent = "";
    if (fileText && fileText.trim().length > 0) {
      contextContent += `[UPLOADED DOCUMENT CONTENT]:\n${fileText.trim()}\n\n`;
    }
    if (prompt && prompt.trim().length > 0) {
      contextContent += `[USER PROMPT / INSTRUCTION]:\n${prompt.trim()}`;
    }

    if (!contextContent) {
      return NextResponse.json(
        { error: "Please provide text input or upload a document to process." },
        { status: 400 }
      );
    }

    let taskInstruction = "Summarize the provided content clearly.";
    if (action === "execSummary") {
      taskInstruction = "Provide a thorough executive summary covering key objectives, findings, and results.";
    } else if (action === "actionItems") {
      taskInstruction = "Extract clear, bulleted key action items with responsibilities where available.";
    } else if (action === "takeaways") {
      taskInstruction = "Extract top strategic takeaways and core insights.";
    } else if (action === "analyzeTrends") {
      taskInstruction = "Analyze key trends, patterns, and data points present in the text.";
    }

    // Dynamic model lookup
    let modelsToTry: string[] = [];
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const listData = await listRes.json();

      if (listData.models && Array.isArray(listData.models)) {
        modelsToTry = listData.models
          .filter((m: any) => 
            m.supportedGenerationMethods?.includes("generateContent") &&
            !m.name.includes("embedding") &&
            !m.name.includes("imagen")
          )
          .map((m: any) => m.name.replace("models/", ""));
      }
    } catch (e) {
      console.error("Model discovery error:", e);
    }

    if (modelsToTry.length === 0) {
      modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
    }

    let resultText = "";
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ 
                  text: `You are a professional AI document processing assistant. You must ONLY output the final summary result in ${language || "English"}. Never include internal reasoning, chain-of-thought, or analysis logs in your response.` 
                }]
              },
              contents: [{
                parts: [{ text: `${taskInstruction}\n\n${contextContent}` }]
              }]
            }),
          }
        );

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          resultText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data.error?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastError = err.message || "Network request failed.";
      }
    }

    if (!resultText) {
      return NextResponse.json(
        { error: `API Processing Failed: ${lastError}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: resultText.trim() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
