import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator, RequestAnalyzer } from '@/utils/multiAgentOrchestrator';
import type { RobloxScriptType } from 'roblox-claude-codegen';
import { ensureApiKey } from '@/lib/utils/api-key';

export async function POST(request: NextRequest) {
  console.log('📥 Multi-agent API route called');
  
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
    
    console.log('🎯 Multi-agent request:', { prompt, scriptType });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a stream to send updates
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        let isControllerClosed = false;
        
        // Helper to safely close controller
        const closeController = () => {
          if (!isControllerClosed) {
            isControllerClosed = true;
            try {
              controller.close();
            } catch (e) {
              console.error('Error closing controller:', e);
            }
          }
        };
        
        // Helper function to safely write to stream
        const safeWrite = (data: any): boolean => {
          if (!isControllerClosed) {
            try {
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
              return true;
            } catch (e) {
              console.error('Failed to write to stream:', e);
              return false;
            }
          }
          return false;
        };
        
        try {
          // First, analyze the request
          const analyzer = new RequestAnalyzer();
          const decomposition = analyzer.decomposeRequest(prompt, scriptType as RobloxScriptType);
          
          // Send analysis result
          safeWrite({ 
            type: 'analysis', 
            isComplex: decomposition.isComplex,
            complexityScore: decomposition.complexityScore,
            taskCount: decomposition.tasks.length,
            reasoning: decomposition.reasoning
          });

          if (!decomposition.isComplex) {
            // Simple request - redirect to standard generation
            safeWrite({ 
              type: 'redirect', 
              message: 'Request is simple, using standard generation'
            });
            safeWrite({ type: 'done' });
            closeController();
            return; // Exit early, no need to continue
          }

          // Send task breakdown
          safeWrite({ 
            type: 'tasks', 
            tasks: decomposition.tasks
          });

          // Create orchestrator
          const orchestrator = new MultiAgentOrchestrator();
          
          // Track if we should continue processing
          let shouldContinue = true;
          
          // Subscribe to progress updates
          orchestrator.onProgress((progress) => {
            if (shouldContinue && !isControllerClosed) {
              const written = safeWrite({ 
                type: 'progress', 
                progress: progress
              });
              if (!written) {
                shouldContinue = false;
              }
            }
          });

          // Execute the multi-agent generation
          const result = await orchestrator.handleRequest(
            prompt,
            scriptType as RobloxScriptType,
            apiKey
          );

          if (!shouldContinue || isControllerClosed) {
            return; // Client disconnected
          }

          // Send the final result
          if (result.success && result.result) {
            safeWrite({ 
              type: 'code', 
              code: result.result.files[0]?.content || '',
              filename: result.result.files[0]?.path || 'generated.lua',
              tasks: result.tasks
            });
          } else {
            safeWrite({ 
              type: 'error', 
              error: result.error || 'Failed to generate code with multi-agent approach'
            });
          }

          // Send completion
          safeWrite({ type: 'done' });
          
        } catch (error) {
          console.error('❌ Multi-agent generation error:', error);
          safeWrite({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          safeWrite({ type: 'done' });
        } finally {
          // Always ensure controller is closed
          closeController();
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
    console.error('❌ Multi-agent API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}