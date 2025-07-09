import { NextRequest, NextResponse } from 'next/server';
import { query, type SDKMessage } from "@anthropic-ai/claude-code";

export async function POST(request: NextRequest) {
  console.log('📥 Direct Claude Code SDK API route');
  
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { prompt, scriptType = 'server' } = body;
    
    console.log('🎯 Request:', { prompt, scriptType });
    
    // Build Roblox-specific prompt
    const fullPrompt = `You are an expert Roblox game developer. Generate a ${scriptType} script in Luau for Roblox Studio.

Requirements:
- Use proper Roblox services and APIs
- Include type checking with --!strict
- Follow Luau best practices
- Add helpful comments

User request: ${prompt}

Generate ONLY the Luau code without any markdown formatting or explanations.`;

    const messages: SDKMessage[] = [];
    const encoder = new TextEncoder();
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start', 
              message: 'Connecting to Claude...' 
            })}\n\n`)
          );

          console.log('🚀 Starting Claude Code query...');
          const startTime = Date.now();
          
          for await (const message of query({
            prompt: fullPrompt,
            options: {
              maxTurns: 3,
              permissionMode: 'bypassPermissions' as any,
            },
          })) {
            console.log(`📨 Message type: ${message.type}`);
            messages.push(message);
            
            // Stream progress updates
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'progress', 
                message: `Processing... (${message.type})` 
              })}\n\n`)
            );
            
            // Extract code from assistant messages
            if (message.type === 'assistant' && message.message?.content) {
              const content = message.message.content;
              
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === 'text') {
                    const code = block.text;
                    console.log('✅ Found code block:', code.substring(0, 100) + '...');
                    
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ 
                        type: 'code', 
                        code: code,
                        filename: `script.${scriptType}.lua` 
                      })}\n\n`)
                    );
                  }
                }
              }
            }
          }
          
          const duration = Date.now() - startTime;
          console.log(`✅ Query complete in ${duration}ms, ${messages.length} messages`);
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'done',
              duration,
              messageCount: messages.length
            })}\n\n`)
          );
          
        } catch (error) {
          console.error('❌ Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}