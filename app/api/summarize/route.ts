import { NextResponse } from "next/server";

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

    let systemInstruction = `You are an expert AI content assistant. Respond in ${language || "English"}.`;
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

    // Active 3-Model Fallback Chain for Gemini 2.0
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-pro-exp-02-05"
    ];
    
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
              contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }]
            }),
          }
        );

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          resultText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data.error?.message || "Model request returned no valid candidate.";
        }
      } catch (err: any) {
        lastError = err.message || "Network request failed.";
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
