import { NextRequest, NextResponse } from 'next/server';
import { generateRobloxCode } from 'roblox-claude-codegen';
import { RobloxScriptType } from 'roblox-claude-codegen';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { message, currentCode, scriptType, originalPrompt, conversationHistory } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Analyze user intent
    const isQuestion = message.match(/\b(how|what|why|where|when|can|should|is|are|do|does|explain|tell)\b/i);
    const isErrorReport = message.toLowerCase().includes('error') || message.includes('ServerScriptService') || message.includes('attempt to') || message.includes('nil');
    const requestsChange = message.match(/\b(make|add|change|update|modify|fix|create|implement|remove|delete|replace)\b/i);
    
    // Create a context-aware prompt
    let enhancedPrompt = '';
    let shouldGenerateCode = false;
    
    // Check if we have existing code
    if (currentCode && currentCode.trim()) {
      enhancedPrompt = `You are a helpful Roblox development assistant. The user has a ${scriptType} script they generated. `;
      enhancedPrompt += `Original request: "${originalPrompt}". `;
      enhancedPrompt += `\n\nCurrent code:\n\`\`\`lua\n${currentCode}\n\`\`\`\n\n`;
      
      if (isErrorReport) {
        // User reporting an error - fix the code
        enhancedPrompt += `The user encountered this error: "${message}". Please analyze the error and provide a fixed version of the code. Explain what caused the error and how you fixed it.`;
        shouldGenerateCode = true;
      } else if (requestsChange && !isQuestion) {
        // User wants to modify the code
        enhancedPrompt += `User request: "${message}". Please modify the code according to this request and explain the changes.`;
        shouldGenerateCode = true;
      } else {
        // User is asking a question - don't modify code
        enhancedPrompt += `User question: "${message}". Answer their question about the code, Roblox development, or implementation. Do NOT generate new code unless explicitly asked. Provide helpful guidance and explanations.`;
        shouldGenerateCode = false;
      }
    } else {
      // No existing code
      if (requestsChange || !isQuestion) {
        // User wants to generate code
        enhancedPrompt = `Generate a Roblox ${scriptType} script based on this request: "${message}". `;
        if (originalPrompt && originalPrompt !== message) {
          enhancedPrompt += `Context: The user originally tried to generate: "${originalPrompt}" but it was too complex. `;
        }
        enhancedPrompt += `Keep the implementation simple and focused. Explain your approach.`;
        shouldGenerateCode = true;
      } else {
        // User is asking a general question
        enhancedPrompt = `You are a helpful Roblox development assistant. User question: "${message}". Answer their question about Roblox development, scripting, or Studio usage. Provide helpful guidance without generating code unless explicitly asked.`;
        shouldGenerateCode = false;
      }
    }

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      enhancedPrompt += '\n\nPrevious conversation:';
      conversationHistory.slice(-4).forEach((msg: any) => {
        enhancedPrompt += `\n${msg.role}: ${msg.content}`;
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message with intent analysis
          let initialMessage = '';
          if (currentCode && currentCode.trim()) {
            if (isQuestion && !requestsChange) {
              initialMessage = '💬 I understand you have a question. Let me help explain without modifying your code...\n\n';
            } else if (isErrorReport) {
              initialMessage = '🔧 I see you\'re reporting an error. Let me analyze and fix it for you...\n\n';
            } else if (requestsChange) {
              initialMessage = '✏️ I\'ll help you modify the code as requested...\n\n';
            } else {
              initialMessage = 'Let me analyze your request and help you...\n\n';
            }
          } else {
            if (isQuestion && !requestsChange) {
              initialMessage = '💬 I\'ll answer your question about Roblox development...\n\n';
            } else {
              initialMessage = '🚀 Let me help you generate the code...\n\n';
            }
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'message', 
            content: initialMessage
          })}\n\n`));

          // Generate improved code
          const options = {
            apiKey: process.env.ANTHROPIC_API_KEY!,
            scriptType: scriptType as RobloxScriptType,
            onMessage: (message: string) => {
              // Don't send empty messages
              if (message && message.trim()) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'message', 
                  content: message 
                })}\n\n`));
              }
            }
          };
          
          console.log('🤖 Chat intent analysis:', {
            isQuestion,
            isErrorReport,
            requestsChange,
            shouldGenerateCode,
            messageLength: message.length
          });

          const context = {
            gameType: 'other' as const,
            existingServices: [],
            dependencies: []
          };

          const result = await generateRobloxCode(
            enhancedPrompt,
            options,
            context
          );

          console.log('Chat generation result:', {
            success: result.success,
            filesCount: result.files.length,
            messagesCount: result.messages?.length || 0,
            errors: result.errors
          });

          // Stream assistant messages to show the conversation
          if (result.messages && result.messages.length > 0) {
            for (const msg of result.messages) {
              if (msg.type === 'assistant' && msg.message?.content) {
                const textContent = msg.message.content
                  .filter((block: any) => block.type === 'text')
                  .map((block: any) => block.text)
                  .join('\n');
                
                if (textContent && textContent.trim()) {
                  // Send the assistant's explanation
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'message', 
                    content: textContent
                  })}\n\n`));
                }
              }
            }
          }

          // Extract code from the result only if we should generate code
          if (shouldGenerateCode && result.success && result.files.length > 0) {
            const { content, path } = result.files[0];
            console.log('🚀 Chat API: Sending code update');
            console.log('  - Code length:', content?.length || 0);
            console.log('  - Filename:', path);
            console.log('  - First 100 chars:', content?.substring(0, 100));
            
            // Send the updated code
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'code', 
              code: content,
              filename: path
            })}\n\n`));
          } else {
            // Try to extract code from messages as fallback
            let extractedCode = null;
            if (result.messages && result.messages.length > 0) {
              console.log('Attempting to extract code from messages...');
              
              // Look for code in assistant messages
              for (const msg of result.messages.reverse()) {
                if (msg.type === 'assistant' && msg.message?.content) {
                  const textContent = msg.message.content
                    .filter((block: any) => block.type === 'text')
                    .map((block: any) => block.text)
                    .join('\n');
                  
                  // Look for Lua code blocks
                  const codeMatch = textContent.match(/```(?:lua|luau)?\n([\s\S]*?)```/);
                  if (codeMatch) {
                    extractedCode = codeMatch[1].trim();
                    console.log('Found code in assistant message');
                    break;
                  }
                }
              }
            }

            if (shouldGenerateCode && extractedCode) {
              console.log('🚀 Chat API: Sending extracted code');
              console.log('  - Code length:', extractedCode?.length || 0);
              console.log('  - First 100 chars:', extractedCode?.substring(0, 100));
              
              // Send the extracted code
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'code', 
                code: extractedCode,
                filename: 'script.lua'
              })}\n\n`));
            } else if (shouldGenerateCode) {
              // If generation failed and we were trying to generate code, send error
              const errorMessage = result.errors?.join('\n') || 'Failed to generate code. Try a simpler request.';
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: errorMessage
              })}\n\n`));
            }
          }

          // Send completion message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`));

        } catch (error) {
          console.error('Chat generation error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'An error occurred' 
          })}\n\n`));
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
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}