import { query, type SDKMessage } from "@anthropic-ai/claude-code";

async function testSDK() {
  console.log('🧪 Testing Claude Code SDK directly');
  console.log('🔑 API Key:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not set');
  
  const messages: SDKMessage[] = [];
  
  try {
    const abortController = new AbortController();
    
    console.log('📤 Starting query...');
    for await (const message of query({
      prompt: "Create a simple Roblox script that prints hello world",
      abortController,
      options: {
        maxTurns: 1,
      },
    })) {
      console.log('📨 Received message:', {
        type: message.type,
        hasContent: message.type === 'assistant' ? !!message.message?.content : 'N/A'
      });
      messages.push(message);
    }
    
    console.log('✅ Query complete!');
    console.log('Total messages:', messages.length);
    
    // Extract code from assistant messages
    for (const msg of messages) {
      if (msg.type === 'assistant' && msg.message?.content) {
        const content = msg.message.content;
        console.log('Assistant message content type:', Array.isArray(content) ? 'array' : typeof content);
        
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text') {
              console.log('Text block:', block.text.substring(0, 100) + '...');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ SDK Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
  }
}

// Run the test
testSDK();