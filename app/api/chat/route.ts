import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function POST(req: Request) {
  try {
    const { modelId, messages, imageBase64 } = await req.json();

    await dbConnect();
    const settings = await Settings.findOne();
    const apiKey = settings?.featherlessApiKey || process.env.FEATHERLESS_API_KEY;

    if (!apiKey) {
      return new Response('Missing API Key', { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.featherless.ai/v1',
    });

    // Handle multimodal messages ONLY if image is present AND model is vision-capable
    const isVisionModel = 
      modelId.toLowerCase().includes('vision') || 
      modelId.toLowerCase().includes('pixtral') || 
      modelId.toLowerCase().includes('llava');

    const formattedMessages = messages.map((m: any, idx: number) => {
      if (idx === messages.length - 1 && imageBase64 && isVisionModel) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
          ]
        };
      }
      return m;
    });

    const response = await openai.chat.completions.create({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      max_tokens: 2048,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err: any) {
          console.error('Streaming error in route:', err);
          // Don't kill the whole stream if possible, but we must signal the error
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(error.message || 'Error in chat completion', { status: 500 });
  }
}
