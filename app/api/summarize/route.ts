import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in Vercel. Add it under Vercel Settings > Environment Variables." },
        { status: 500 }
      );
    }

    const { text, fileData, promptType, language } = await req.json();

    // 1. Query Google API to get all available models for this specific API key
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!modelsResponse.ok) {
      const errData = await modelsResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `API Key Error: ${errData?.error?.message || "Invalid API key or project permission issues. Generate a new key at aistudio.google.com."}` },
        { status: 400 }
      );
    }

    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.models || [];

    // 2. Automatically select the best active model supporting content generation
    const activeModelObj = availableModels.find((m: any) =>
      m.supportedGenerationMethods?.includes("generateContent") &&
      (m.name.includes("flash") || m.name.includes("pro"))
    ) || availableModels.find((m: any) =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!activeModelObj) {
      return NextResponse.json(
        { error: "No content generation models are enabled for this API key. Create a fresh key at aistudio.google.com." },
        { status: 400 }
      );
    }

    // Strip 'models/' prefix for the SDK call
    const modelName = activeModelObj.name.replace(/^models\//, "");

    // 3. Generate response using the discovered working model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemInstruction = `You are an interactive AI web assistant and document analyzer. 
Answer questions, follow instructions, engage in natural conversation, and analyze uploaded content.
CRITICAL MANDATE: Respond ENTIRELY in this language: "${language || 'English'}".
Context/Task: ${promptType || 'General Chat'}`;

    const promptText = `${systemInstruction}\n\nUser Input / Document:\n${text || "Hello"}`;

    let contents: any[] = [promptText];
    if (fileData && fileData.inlineData) {
      contents.push(fileData);
    }

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText, modelUsed: modelName });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}
