import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemInstruction = `
You are the AI Document Workbench assistant.
STRICT FORMATTING REQUIREMENTS:
1. DO NOT use Markdown symbols anywhere in your response (** , *, #, ##, ###, ---).
2. Format titles and sections using clean line breaks and UPPERCASE text.
3. Present lists using simple numbers (1., 2.) or standard dashes (-).
4. ABSOLUTELY NO LATEX, HTML, OR PIPE TABLES.
5. Output clean plain text.
`;

// Provider 1: Groq API (Free Tier: ~14,400 req/day)
async function callGroq(prompt: string) {
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
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    }),
  });

  if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

// Provider 2: OpenRouter Free Models
async function callOpenRouter(prompt: string) {
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
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter API Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

// Provider 3: Gemini API Backup
async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { text, promptType } = await req.json();
    const prompt = text || promptType || "Please summarize the provided text.";

    let reply = "";

    // Array of AI Provider functions to attempt in order
    const providers = [
      { name: "Groq", fn: () => callGroq(prompt) },
      { name: "OpenRouter", fn: () => callOpenRouter(prompt) },
      { name: "Gemini", fn: () => callGemini(prompt) },
    ];

    for (const provider of providers) {
      try {
        console.log(`Attempting request with: ${provider.name}`);
        reply = await provider.fn();
        if (reply) break; // Exit loop on successful output
      } catch (err: any) {
        console.warn(`${provider.name} failed (${err.message}). Trying next AI...`);
      }
    }

    if (!reply) {
      return NextResponse.json({
        reply: "All free AI providers are currently rate-limited. Please wait 10 seconds and try again."
      });
    }

    // Clean residual formatting
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
