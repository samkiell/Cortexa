import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import User from '@/lib/models/User';
import RateLimit from '@/lib/models/RateLimit';
import { webSearch } from '@/lib/search';
import { CURATED_MODELS } from '@/lib/featherless';
import { startOfHour } from 'date-fns';
import { decrypt } from '@/lib/crypto';

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const isSuspended = (session.user as any).suspended;

    if (isSuspended) {
      return new Response('Your account has been suspended.', { status: 403 });
    }

    const { modelId, messages, imageBase64, searchEnabled } = await req.json();

    await dbConnect();

    // Per-user Rate Limiting (Skip for Admin)
    if (userRole !== 'admin') {
      const now = new Date();
      const hourStart = startOfHour(now);
      const resetAt = new Date(hourStart.getTime() + 60 * 60 * 1000);

      let limitDoc = await RateLimit.findOne({ userId });
      if (!limitDoc || limitDoc.windowStart < hourStart) {
        // Reset or new window
        limitDoc = await RateLimit.findOneAndUpdate(
          { userId },
          { count: 1, windowStart: hourStart },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (limitDoc.count >= 30) {
        return NextResponse.json({ 
          error: 'Message limit reached',
          message: 'You have reached the limit of 30 messages per hour.',
          resetAt: resetAt.toISOString()
        }, { status: 429 });
      } else {
        limitDoc.count += 1;
        await limitDoc.save();
      }
    }

    const settings = await Settings.findOne();
    const apiKeyRaw = settings?.featherlessApiKey || process.env.FEATHERLESS_API_KEY;

    // Use decryption if apiKey from DB is encrypted
    let apiKey = apiKeyRaw;
    if (apiKeyRaw && apiKeyRaw.includes(':')) {
       apiKey = decrypt(apiKeyRaw);
    }

    if (!apiKey) {
      return new Response('Missing API Key', { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.featherless.ai/v1',
    });

    const modelInfo = CURATED_MODELS.find(m => m.id === modelId);
    if (!modelInfo) {
      console.error(`Model not found: ${modelId}`);
      return NextResponse.json({ error: 'Selected model is not available.' }, { status: 400 });
    }

    const isVisionModel = modelInfo.vision || false;
    const supportsTools = modelInfo.supportsTools || false;
    let canSearch = searchEnabled && supportsTools;

    const formattedMessages = messages.map((m: any, idx: number) => {
      if (idx === messages.length - 1 && imageBase64 && isVisionModel) {
        let imageUrl = imageBase64;
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          imageUrl = `data:image/jpeg;base64,${imageUrl}`;
        }
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        };
      }
      return m;
    });

    let toolCalls: any[] = [];
    let initialResponse: any = null;

    if (canSearch) {
      try {
        initialResponse = await openai.chat.completions.create({
          model: modelId,
          messages: formattedMessages,
          tools: [searchTool as any],
          tool_choice: 'auto',
        });

        const message = initialResponse?.choices?.[0]?.message;
        if (message?.tool_calls) {
          toolCalls = message.tool_calls;
        }
      } catch (err: any) {
        console.error('Initial completion error with tools:', err);
        // Fallback to standard completion if tools fail
        canSearch = false;
      }
    }

    const encoder = new TextEncoder();

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      let query;
      try {
        const args = JSON.parse(toolCall.function.arguments);
        query = args.query;
      } catch (e) {
        console.error('Failed to parse tool arguments:', e);
        // Continue with standard flow instead of crashing
        toolCalls = [];
      }

      if (query) {
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
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
    }

    // Standard streaming flow (no tool call or tools disabled)
    try {
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
    } catch (apiError: any) {
      console.error('Featherless API Error:', apiError);
      return NextResponse.json({ 
        error: apiError.error || apiError.message || 'Error from AI provider. Please try again later.' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Global Chat API error:', error);
    return NextResponse.json({ 
      error: 'An internal server error occurred.' 
    }, { status: 500 });
  }
}
