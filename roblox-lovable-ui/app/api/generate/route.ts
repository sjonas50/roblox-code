import { NextRequest, NextResponse } from 'next/server';
import { generateRobloxCode } from 'roblox-claude-codegen';
import type { SDKMessage } from '@anthropic-ai/claude-code';
import { ensureApiKey } from '@/lib/utils/api-key';

export async function POST(request: NextRequest) {
  console.log('📥 API route called - generate');
  
  // Ensure API key is available
  const apiKey = ensureApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured. Please set CLAUDE_API_KEY in environment variables' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { prompt, scriptType = 'server' } = body;
    
    console.log('🎯 Generation request:', { prompt, scriptType });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a stream to send updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start', 
              message: 'Starting code generation...' 
            })}\n\n`)
          );

          // Custom handler to capture messages
          const messages: SDKMessage[] = [];
          let generatedCode = '';
          
          console.log('🚀 Calling generateRobloxCode...');
          console.log('📌 Environment check:', {
            hasApiKey: !!process.env.ANTHROPIC_API_KEY,
            apiKeyLength: process.env.ANTHROPIC_API_KEY?.length,
            usingClaudeKey: !!process.env.CLAUDE_API_KEY
          });
          
          try {
            // Generate the code
            const result = await generateRobloxCode(
              prompt,
              {
                scriptType: scriptType as 'server' | 'client' | 'module',
                useTypeChecking: true,
                permissionMode: 'bypassPermissions',
                maxTurns: 5
              },
              {
                gameType: 'other',
                existingServices: ['Players', 'Workspace', 'ReplicatedStorage']
              }
            );

            console.log('✅ Generation result:', { 
              success: result.success, 
              files: result.files.length,
              errors: result.errors,
              messagesCount: result.messages?.length || 0
            });
            
            // Debug log first few messages
            if (result.messages && result.messages.length > 0) {
              console.log('📝 First message:', result.messages[0]);
            }

          // Stream the messages
          for (const message of result.messages) {
            if (message.type === 'assistant') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'assistant', 
                  message: 'Claude is thinking...',
                  content: message
                })}\n\n`)
              );
            }
          }

          // Stream the final result
          if (result.success && result.files.length > 0) {
            generatedCode = result.files[0].content;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'code', 
                code: generatedCode,
                filename: result.files[0].path 
              })}\n\n`)
            );
          } else {
            const errorMessage = result.errors?.join(', ') || 'Failed to generate code';
            console.error('❌ Generation failed:', errorMessage);
            
            // Check for JSON parse errors (indicates response too large)
            if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected end')) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: 'The request was too complex. Try breaking it down:\n\n' +
                         '1. First ask for the basic racing game mechanics\n' +
                         '2. Then ask to add the checkpoint system\n' +
                         '3. Finally ask for timers and UI\n\n' +
                         'Example: "Create a basic racing game with a car that can move"'
                })}\n\n`)
              );
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: errorMessage 
                })}\n\n`)
              );
            }
          }
          } catch (innerError) {
            console.error('❌ Inner generation error:', innerError);
            
            // Handle JSON parse errors specifically
            if (innerError instanceof Error && innerError.message.includes('JSON')) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: 'Request too large. Please try a simpler prompt or break it into smaller parts.' 
                })}\n\n`)
              );
            } else {
              throw innerError;
            }
          }

          // Always send completion to reset UI
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );
          
        } catch (error) {
          console.error('❌ Generation error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
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
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}