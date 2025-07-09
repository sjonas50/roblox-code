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

    // Create a context-aware prompt
    let enhancedPrompt = '';
    
    // Check if we have existing code
    if (currentCode && currentCode.trim()) {
      enhancedPrompt = `You are helping improve a Roblox ${scriptType} script. `;
      enhancedPrompt += `Original request: "${originalPrompt}". `;
      enhancedPrompt += `\n\nCurrent code:\n\`\`\`lua\n${currentCode}\n\`\`\`\n\n`;
      
      // Check if the message contains an error
      if (message.toLowerCase().includes('error') || message.includes('ServerScriptService') || message.includes('attempt to') || message.includes('nil')) {
        enhancedPrompt += `The user encountered this error: "${message}". Please analyze the error and provide a fixed version of the code. Explain what caused the error and how you fixed it.`;
      } else {
        enhancedPrompt += `User request: "${message}". Please modify the code according to this request and explain the changes.`;
      }
    } else {
      // No existing code - this is a new generation request
      enhancedPrompt = `Generate a Roblox ${scriptType} script based on this request: "${message}". `;
      if (originalPrompt && originalPrompt !== message) {
        enhancedPrompt += `Context: The user originally tried to generate: "${originalPrompt}" but it was too complex. `;
      }
      enhancedPrompt += `Keep the implementation simple and focused. Explain your approach.`;
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
          // Send initial message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'message', 
            content: 'Let me analyze your code and help you fix the sword positioning...\n\n' 
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

          // Extract code from the result
          if (result.success && result.files.length > 0) {
            const { content, path } = result.files[0];
            
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

            if (extractedCode) {
              // Send the extracted code
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'code', 
                code: extractedCode,
                filename: 'script.lua'
              })}\n\n`));
            } else {
              // If generation failed, send error
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