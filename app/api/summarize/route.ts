import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const { text, history, fileData, promptType, language } = await req.json();

    // 1. Query Google REST API directly to discover active models for this API key
    let selectedModel = "gemini-1.5-flash"; // default fallback
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const validModels = (listData.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name.replace(/^models\//, ""));

        if (validModels.length > 0) {
          // Prefer flash or pro model available to the key
          selectedModel =
            validModels.find((m: string) => m.includes("flash") || m.includes("pro")) ||
            validModels[0];
        }
      }
    } catch (err) {
      console.warn("Model discovery fallback used");
    }

    // 2. Build system instructions and continuous chat context
    const systemInstruction = `You are an interactive conversational AI document analyzer and web workbench.
You maintain continuous dialogue, answer follow-up queries, and analyze documents.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Task Context: ${promptType || 'General Conversation'}`;

    let promptText = `${systemInstruction}\n\n`;

    if (Array.isArray(history) && history.length > 0) {
      promptText += `--- Conversation History ---\n`;
      history.slice(-8).forEach((msg: { role: string; content: string }) => {
        promptText += `${msg.role === "user" ? "User" : "AI"}: ${msg.content}\n`;
      });
      promptText += `--- End History ---\n\n`;
    }

    promptText += `New User Command / Input:\n${text || "Process request"}`;

    const parts: any[] = [{ text: promptText }];

    if (fileData && fileData.inlineData) {
      parts.push({
        inline_data: {
          mime_type: fileData.inlineData.mimeType,
          data: fileData.inlineData.data,
        },
      });
    }

    // 3. Make direct REST API call to discovered model endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const aiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    const aiData = await aiRes.json();

    if (!aiRes.ok) {
      return NextResponse.json(
        { error: aiData?.error?.message || `API call failed for model ${selectedModel}` },
        { status: aiRes.status }
      );
    }

    const replyText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      return NextResponse.json({ error: "No response text returned from Gemini." }, { status: 500 });
    }

    return NextResponse.json({ reply: replyText, modelUsed: selectedModel });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
