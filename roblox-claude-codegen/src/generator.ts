import { query, type SDKMessage } from "@anthropic-ai/claude-code";
import type { TextBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { 
  RobloxGenerationOptions, 
  GeneratedCode, 
  GeneratedFile,
  RobloxContext,
  SystemPromptOptions 
} from './types.js';
import { generateSystemPrompt, enhanceUserPrompt } from './prompts.js';
import * as path from 'path';

export async function generateRobloxCode(
  prompt: string,
  options: RobloxGenerationOptions,
  context?: RobloxContext
): Promise<GeneratedCode> {
  const messages: SDKMessage[] = [];
  const files: GeneratedFile[] = [];
  const errors: string[] = [];
  
  try {
    // Generate system prompt with Roblox context
    const systemPromptOptions: SystemPromptOptions = {
      scriptType: options.scriptType,
      context,
      additionalInstructions: options.useTypeChecking 
        ? "Add --!strict at the top of the script for type checking" 
        : undefined
    };
    
    const systemPrompt = options.customSystemPrompt || generateSystemPrompt(systemPromptOptions);
    const enhancedPrompt = enhanceUserPrompt(prompt, options.scriptType);
    
    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nUser request: ${enhancedPrompt}`;
    
    // Query Claude Code SDK
    const abortController = new AbortController();
    
    // Default to bypassPermissions for automatic operation
    const permissionMode = options.permissionMode || 
      process.env.CLAUDE_CODE_PERMISSION_MODE || 
      'bypassPermissions';
    
    // Log permission mode if not default
    if (permissionMode === 'bypassPermissions') {
      console.log('🔓 Using automatic permissions for code generation');
    }
    
    console.log('📤 Sending query to Claude Code SDK...');
    
    // Use the local CLI if available
    const localCliPath = path.join(__dirname, '..', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
    console.log('🔍 Checking for local CLI at:', localCliPath);
    
    const queryOptions: any = {
      maxTurns: options.maxTurns || 3,
      permissionMode: permissionMode as any,
      allowedTools: options.allowedTools,
      cwd: options.cwd,
    };
    
    // If local CLI exists, use it
    if (require('fs').existsSync(localCliPath)) {
      console.log('✅ Using local Claude Code CLI');
      queryOptions.pathToClaudeCodeExecutable = localCliPath;
    }
    
    const queryIterator = query({
      prompt: fullPrompt,
      abortController,
      options: queryOptions,
    });
    
    let messageCount = 0;
    for await (const message of queryIterator) {
      messageCount++;
      console.log(`📨 Received message ${messageCount}:`, message.type);
      messages.push(message);
      
      // Process assistant messages to extract generated code
      if (message.type === 'assistant' && message.message.content) {
        // Extract text content from the assistant message
        const textContent = message.message.content
          .filter((block): block is TextBlock => block.type === 'text')
          .map(block => block.text)
          .join('\n');
          
        if (textContent) {
          const generatedCode = extractLuauCode(textContent);
          if (generatedCode) {
            const fileName = generateFileName(options.scriptType, options.targetService);
            files.push({
              path: fileName,
              content: generatedCode,
              type: 'lua'
            });
          }
        }
      }
      
      // Handle result messages for errors
      if (message.type === 'result' && message.is_error) {
        if (message.subtype === 'error_max_turns') {
          errors.push('Maximum turns reached without completing the task');
        } else if (message.subtype === 'error_during_execution') {
          errors.push('Error occurred during execution');
        }
      }
    }
    
    // If no files were generated, try to extract from all assistant messages
    if (files.length === 0) {
      const fullText = messages
        .filter((m): m is typeof m & { type: 'assistant' } => 
          m.type === 'assistant' && 'message' in m && m.message.content !== undefined
        )
        .map(m => m.message.content
          .filter((block): block is TextBlock => block.type === 'text')
          .map(block => block.text)
          .join('\n')
        )
        .join('\n');
        
      const extractedCode = extractLuauCode(fullText);
      if (extractedCode) {
        const fileName = generateFileName(options.scriptType, options.targetService);
        files.push({
          path: fileName,
          content: extractedCode,
          type: 'lua'
        });
      }
    }
    
    return {
      success: files.length > 0 && errors.length === 0,
      files,
      messages,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        scriptType: options.scriptType,
        targetService: options.targetService,
        generatedAt: new Date()
      }
    };
    
  } catch (error) {
    console.error('🔴 Generator error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      messagesReceived: messages.length
    });
    
    return {
      success: false,
      files: [],
      messages,
      errors: [
        error instanceof Error ? error.message : 'Unknown error occurred',
        `Messages received: ${messages.length}`
      ],
      metadata: {
        scriptType: options.scriptType,
        targetService: options.targetService,
        generatedAt: new Date()
      }
    };
  }
}

function extractLuauCode(text: string): string | null {
  // Remove any markdown code blocks if present
  const codeBlockMatch = text.match(/```(?:lua|luau)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code blocks, assume the entire text is Luau code
  // Check if it looks like Luau code (contains common Luau keywords)
  const luauKeywords = ['local', 'function', 'if', 'then', 'end', 'return', 'game', 'script'];
  const hasLuauKeywords = luauKeywords.some(keyword => text.includes(keyword));
  
  if (hasLuauKeywords) {
    return text.trim();
  }
  
  return null;
}

function generateFileName(scriptType: string, targetService?: string): string {
  const timestamp = Date.now();
  const servicePath = targetService ? `${targetService}/` : '';
  
  switch (scriptType) {
    case 'server':
      return `${servicePath}Script_${timestamp}.server.lua`;
    case 'client':
      return `${servicePath}LocalScript_${timestamp}.client.lua`;
    case 'module':
      return `${servicePath}Module_${timestamp}.lua`;
    default:
      return `${servicePath}Script_${timestamp}.lua`;
  }
}

// Helper function to generate a basic Rojo project file
export function generateRojoProject(projectName: string, files: GeneratedFile[]): GeneratedFile {
  const tree: any = {
    $className: "DataModel",
    ServerScriptService: {
      $className: "ServerScriptService"
    },
    StarterPlayer: {
      $className: "StarterPlayer",
      StarterPlayerScripts: {
        $className: "StarterPlayerScripts"
      }
    },
    ReplicatedStorage: {
      $className: "ReplicatedStorage"
    }
  };
  
  // Add file references to the tree based on their paths
  files.forEach(file => {
    if (file.path.includes('.server.lua')) {
      const name = path.basename(file.path, '.server.lua');
      tree.ServerScriptService[name] = {
        $path: file.path
      };
    } else if (file.path.includes('.client.lua')) {
      const name = path.basename(file.path, '.client.lua');
      tree.StarterPlayer.StarterPlayerScripts[name] = {
        $path: file.path
      };
    } else if (file.path.endsWith('.lua')) {
      const name = path.basename(file.path, '.lua');
      tree.ReplicatedStorage[name] = {
        $path: file.path
      };
    }
  });
  
  return {
    path: 'default.project.json',
    content: JSON.stringify({
      name: projectName,
      tree
    }, null, 2),
    type: 'json'
  };
}