export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is missing on Vercel." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const finalPrompt = prompt?.trim()
      ? prompt
      : `Please analyze and summarize this document/file in ${language}. Format requirement: ${length}.`;

    const parts: any[] = [{ text: finalPrompt }];

    if (image) {
      let base64Data = image;
      let mimeType = 'image/jpeg';

      if (typeof image === 'string') {
        if (image.includes(',')) {
          const header = image.split(',')[0];
          base64Data = image.split(',')[1];
          const mimeMatch = header.match(/data:(.*?);base64/);
          if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
          }
        } else if (image.startsWith('JVBERi0')) {
          mimeType = 'application/pdf';
        }
      }

      parts.push({
        inlineData: { mimeType: mimeType, data: base64Data }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(
      JSON.stringify({ result: textResult }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Internal Server Error: ${err.message}` }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
