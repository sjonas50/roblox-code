import { NextRequest, NextResponse } from 'next/server';
import { IntelligentOrchestrator } from '@/utils/intelligentOrchestrator';
import type { RobloxScriptType } from 'roblox-claude-codegen';

export async function POST(request: NextRequest) {
  console.log('🧠 Intelligent generation API route called');
  
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    return NextResponse.json(
      { error: 'API key not configured. Please set ANTHROPIC_API_KEY in .env.local' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { prompt, scriptType = 'server' } = body;
    
    console.log('🎯 Request:', { prompt, scriptType });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a stream to send updates
    const encoder = new TextEncoder();
    let isStreamClosed = false;
    
    const stream = new ReadableStream({
      async start(controller) {
        const safeWrite = (data: any): boolean => {
          if (!isStreamClosed) {
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
        
        const closeStream = () => {
          if (!isStreamClosed) {
            isStreamClosed = true;
            try {
              controller.close();
            } catch (e) {
              console.error('Error closing stream:', e);
            }
          }
        };
        
        try {
          // Start with info message
          safeWrite({
            type: 'start',
            message: 'Analyzing your request with Claude...'
          });

          // Create orchestrator
          const orchestrator = new IntelligentOrchestrator();
          
          // Subscribe to progress updates
          orchestrator.onProgress((update) => {
            safeWrite(update);
          });

          // Execute the intelligent orchestration
          const result = await orchestrator.orchestrate(
            prompt,
            scriptType as RobloxScriptType,
            process.env.ANTHROPIC_API_KEY!
          );

          if (!isStreamClosed) {
            if (result.success && result.result) {
              // Send the generated code
              if (result.result.files && result.result.files.length > 0) {
                // For multi-file results, send the main file
                const mainFile = result.result.files.find(f => f.path.includes('MainGame')) || result.result.files[0];
                
                safeWrite({
                  type: 'code',
                  code: mainFile.content,
                  filename: mainFile.path,
                  allFiles: result.result.files
                });

                // Send file list if multiple files
                if (result.result.files.length > 1) {
                  safeWrite({
                    type: 'info',
                    content: `Generated ${result.result.files.length} files. Main file shown above.`
                  });
                }
              }
              
              safeWrite({
                type: 'success',
                message: 'Generation complete!'
              });
            } else {
              safeWrite({
                type: 'error',
                error: result.error || 'Failed to generate code'
              });
            }

            // Send completion
            safeWrite({ type: 'done' });
          }
          
        } catch (error) {
          console.error('❌ Intelligent generation error:', error);
          safeWrite({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          safeWrite({ type: 'done' });
        } finally {
          closeStream();
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