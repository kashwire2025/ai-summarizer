import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, action, language = "English", fileText } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    let contextContent = "";
    if (fileText && fileText.trim().length > 0) {
      contextContent += `[UPLOADED DOCUMENT CONTENT]:\n${fileText.trim()}\n\n`;
    }
    if (prompt && prompt.trim().length > 0) {
      contextContent += `[USER PROMPT / INSTRUCTION]:\n${prompt.trim()}`;
    }

    if (!contextContent) {
      return NextResponse.json(
        { error: "Please provide text input or upload a document." },
        { status: 400 }
      );
    }

    let taskInstruction = "Summarize the provided content clearly.";
    if (action === "execSummary") {
      taskInstruction = "Provide a thorough executive summary highlighting core points.";
    } else if (action === "actionItems") {
      taskInstruction = "Extract clear, bulleted key action items and next steps.";
    } else if (action === "takeaways") {
      taskInstruction = "Extract top strategic takeaways and key insights.";
    } else if (action === "analyzeTrends") {
      taskInstruction = "Analyze key trends, patterns, and critical observations.";
    }

    const systemPrompt = `You are an expert AI summarization assistant.
Task: ${taskInstruction}
Target Output Language: ${language}

STRICT OUTPUT CONSTRAINTS:
- You must ONLY output the final result in ${language}.
- NEVER include internal reasoning, chain-of-thought, prompt reflections, constraint checklists, or analysis logs.
- Do NOT print meta headers like "* Task:", "* Constraint:", or "* Refined Result:".
- Output direct, clean markdown formatted text addressing the prompt immediately.`;

    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
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
              system_instruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                {
                  parts: [{ text: contextContent }],
                },
              ],
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error?.message || `HTTP ${res.status}`;
          continue;
        }

        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          resultText = candidateText;
          break;
        }
      } catch (e: any) {
        lastError = e.message || "Fetch request failed";
      }
    }

    if (!resultText) {
      return NextResponse.json(
        { error: `Gemini API Error: ${lastError || "No response generated."}` },
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
