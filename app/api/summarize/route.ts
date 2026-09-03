export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured." }), { status: 500 });
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const textChunk = json?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                controller.enqueue(encoder.encode(textChunk));
              }
            } catch {
              // Ignore partial JSON buffers
            }
          }
        }
      }
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
