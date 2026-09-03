export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response("Error: GEMINI_API_KEY is not set in Vercel Environment Variables.", { status: 200 });
    }

    const body = await req.json();
    const { prompt, image, language = 'English', length = 'Bullet Points' } = body;

    const finalPrompt = prompt?.trim()
      ? prompt
      : `Please analyze and summarize this document in ${language}. Format requirement: ${length}.`;

    const parts: any[] = [{ text: finalPrompt }];

    if (image) {
      let base64Data = image;
      let mimeType = 'image/jpeg';
      if (typeof image === 'string' && image.includes(',')) {
        const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = image.split(',')[1];
        }
      }
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || 'Gemini API call failed.';
      return new Response(`Gemini API Error: ${errorMsg}`, { status: 200 });
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      return new Response("Error: Gemini returned an empty response.", { status: 200 });
    }

    return new Response(generatedText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (err: any) {
    return new Response(`Server Error: ${err.message}`, { status: 200 });
  }
}
