import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getSystemInstruction(mode?: string, language?: string) {
  let modeInstruction = "";
  if (mode === "action_items") {
    modeInstruction = "FOCUS EXCLUSIVELY ON EXTRACTING TO-DO STEPS, DEADLINES, AND ACTIONABLE ITEMS.";
  } else if (mode === "executive_brief") {
    modeInstruction = "PROVIDE A HIGH-LEVEL EXECUTIVE SUMMARY IN EXACTLY 3 CONCISE PARAGRAPHS.";
  } else if (mode === "key_data") {
    modeInstruction = "EXTRACT AND ISOLATE ALL NUMBERS, DATES, METRICS, AND FINANCIAL FIGURES INTO A CLEAN LIST.";
  }

  return `
You are the AI Document Workbench assistant.
STRICT FORMATTING REQUIREMENTS:
1. DO NOT use Markdown symbols anywhere in your response (** , *, #, ##, ###, ---).
2. Format titles and sections using clean line breaks and UPPERCASE text.
3. Present lists using simple numbers (1., 2.) or standard dashes (-).
4. ABSOLUTELY NO LATEX, HTML, OR PIPE TABLES.
5. Output clean plain text suitable for PDF/TXT generation and text-to-speech reading.
6. TARGET LANGUAGE: ${language || "en"}.
${modeInstruction}
`;
}

// Provider 1: Groq API
async function callGroq(prompt: string, instruction: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`Groq Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

// Provider 2: OpenRouter Free Models
async function callOpenRouter(prompt: string, instruction: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

// Provider 3: Hugging Face Serverless API
async function callHuggingFace(prompt: string, instruction: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("Missing HUGGINGFACE_API_KEY");

  const res = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
    }),
  });

  if (!res.ok) throw new Error(`HuggingFace Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

// Provider 4: Google Gemini Backup
async function callGemini(prompt: string, instruction: string) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: instruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { text, promptType, language, mode } = await req.json();
    const prompt = text || promptType || "Please summarize the provided text.";
    const instruction = getSystemInstruction(mode, language);

    let reply = "";

    const providers = [
      { name: "Groq", fn: () => callGroq(prompt, instruction) },
      { name: "OpenRouter", fn: () => callOpenRouter(prompt, instruction) },
      { name: "HuggingFace", fn: () => callHuggingFace(prompt, instruction) },
      { name: "Gemini", fn: () => callGemini(prompt, instruction) },
    ];

    for (const provider of providers) {
      try {
        reply = await provider.fn();
        if (reply) break;
      } catch (err: any) {
        console.warn(`${provider.name} failed (${err.message}). Trying next provider...`);
      }
    }

    if (!reply) {
      return NextResponse.json({
        reply: "All free AI providers are currently rate-limited. Please wait 10 seconds and try again."
      });
    }

    // Clean residual formatting symbols
    reply = reply.replace(/^#{1,6}\s*/gm, "");
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1");
    reply = reply.replace(/\*(.*?)\*/g, "$1");

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
