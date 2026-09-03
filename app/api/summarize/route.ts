export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is missing in Vercel." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, image, history = [] } = await req.json();

    const parts: any[] = [{ text: prompt || "Summarize this content." }];

    if (image) {
      let base64Data = image;
      let mimeType = 'image/jpeg';

      if (typeof image === 'string') {
        if (image.includes(',')) {
          const header = image.split(',')[0];
          base64Data = image.split(',')[1];
          const mimeMatch = header.match(/data:(.*?);base64/);
          if (mimeMatch && mimeMatch[1]) mimeType = mimeMatch[1];
        } else if (image.startsWith('JVBERi0')) {
          mimeType = 'application/pdf';
        }
      }

      parts.push({ inlineData: { mimeType, data: base64Data } });
    }

    // Filter out failed error messages from history before sending to Gemini
    const cleanHistory = history.filter((h: any) => h.parts && h.parts[0] && !h.parts[0].text.startsWith('Error:'));

    const contents = [
      ...cleanHistory,
      { role: 'user', parts }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini API Error (${response.status}): ${errorText}` }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(
      JSON.stringify({ result: textResult }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Server Error: ${err.message}` }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
