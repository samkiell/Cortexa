import { OpenAIStream, StreamingTextResponse } from 'ai'; // Actually I should use native ReadableStream as requested
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

    // Handle multimodal messages if image is present
    const formattedMessages = messages.map((m: any, idx: number) => {
      if (idx === messages.length - 1 && imageBase64) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        };
      }
      return m;
    });

    const response = await openai.chat.completions.create({
      model: modelId,
      messages: formattedMessages,
      stream: true,
    });

    // Convert the response into a friendly text-stream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
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
