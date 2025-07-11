import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as path from 'path';
import { ensureApiKey } from '@/lib/utils/api-key';

export async function POST(request: NextRequest) {
  console.log('📥 API route v2 called - using subprocess approach');
  
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
    
    // Create a simple script to run
    const scriptContent = `
import { generateRobloxCode } from './src/index.js';

async function generate() {
  const result = await generateRobloxCode(
    "${prompt.replace(/"/g, '\\"')}",
    {
      scriptType: '${scriptType}',
      useTypeChecking: true,
      permissionMode: 'bypassPermissions'
    }
  );
  
  console.log(JSON.stringify(result));
}

generate().catch(console.error);
`;

    // Write to a temporary file and run it
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start', 
              message: 'Starting code generation...' 
            })}\n\n`)
          );

          // Use the installed package directly
          const codegenPath = path.join(process.cwd(), 'node_modules', 'roblox-claude-codegen');
          
          const proc = spawn('npx', ['tsx', '-e', scriptContent], {
            cwd: codegenPath,
            env: {
              ...process.env,
              ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
            }
          });

          let output = '';
          let errorOutput = '';

          proc.stdout.on('data', (data) => {
            output += data.toString();
            console.log('📤 Output chunk:', data.toString().substring(0, 100));
          });

          proc.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('❌ Error output:', data.toString());
          });

          proc.on('close', (code) => {
            console.log('✅ Process closed with code:', code);
            
            try {
              // Find JSON in output
              const jsonMatch = output.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                
                if (result.success && result.files && result.files.length > 0) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ 
                      type: 'code', 
                      code: result.files[0].content,
                      filename: result.files[0].path 
                    })}\n\n`)
                  );
                } else {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ 
                      type: 'error', 
                      error: result.errors?.join(', ') || 'Failed to generate code' 
                    })}\n\n`)
                  );
                }
              } else {
                throw new Error('No valid JSON output found');
              }
            } catch (error) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: `Failed to parse output: ${error}` 
                })}\n\n`)
              );
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
            controller.close();
          });

        } catch (error) {
          console.error('❌ Subprocess error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`)
          );
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