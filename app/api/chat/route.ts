import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { webSearch } from '@/lib/search';
import { CURATED_MODELS } from '@/lib/featherless';

const searchTool = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for current information, news, facts, prices, events, or anything that requires up-to-date knowledge.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  }
};

export async function POST(req: Request) {
  try {
    const { modelId, messages, imageBase64, searchEnabled } = await req.json();

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

    const modelInfo = CURATED_MODELS.find(m => m.id === modelId);
    const isVisionModel = modelInfo?.vision || false;
    const supportsTools = modelInfo?.supportsTools || false;
    const canSearch = searchEnabled && supportsTools;

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

    let toolCalls: any[] = [];
    let initialResponse: any = null;

    if (canSearch) {
      initialResponse = await openai.chat.completions.create({
        model: modelId,
        messages: formattedMessages,
        tools: [searchTool as any],
        tool_choice: 'auto',
      });

      const message = initialResponse.choices[0].message;
      if (message.tool_calls) {
        toolCalls = message.tool_calls;
      }
    }

    const encoder = new TextEncoder();

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const args = JSON.parse(toolCall.function.arguments);
      const query = args.query;

      // Start SSE stream with search signal
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Signal search start
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'search_start', query })}\n\n`));

            const searchResults = await webSearch(query);
            
            const conversationWithTool = [
              ...formattedMessages,
              initialResponse.choices[0].message,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(searchResults)
              }
            ];

            const secondResponse = await openai.chat.completions.create({
              model: modelId,
              messages: conversationWithTool as any,
              stream: true,
            });

            // Signal sources before tokens
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: searchResults.results })}\n\n`));

            for await (const chunk of secondResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          } catch (err: any) {
            console.error('Streaming error in tool loop:', err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Standard streaming flow (no tool call or tools disabled)
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      max_tokens: 2048,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err: any) {
          console.error('Streaming error in route:', err);
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
