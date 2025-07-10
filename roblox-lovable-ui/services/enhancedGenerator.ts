// Enhanced generator with MCP tools and session management
import { generateRobloxCode } from "roblox-claude-codegen";
import { RobloxGenerationOptions, RobloxContext, RobloxScriptType } from "roblox-claude-codegen";
import { MCPRobloxTools } from "./mcpRobloxTools";
import { Session, SessionMessage } from "@/types/project";

export interface EnhancedGenerationOptions extends RobloxGenerationOptions {
  sessionId?: string;
  enableMCPTools?: boolean;
  abortController?: AbortController;
  customTools?: string[];
}

export class EnhancedRobloxGenerator {
  private mcpTools: MCPRobloxTools;
  private sessions: Map<string, Session> = new Map();
  private activeAbortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.mcpTools = new MCPRobloxTools();
  }

  async generateWithSession(
    prompt: string,
    options: EnhancedGenerationOptions,
    context?: RobloxContext
  ) {
    const sessionId = options.sessionId || this.createSessionId();
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = this.createSession(sessionId);
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: prompt,
      timestamp: new Date()
    });

    // Create abort controller if not provided
    const abortController = options.abortController || new AbortController();
    this.activeAbortControllers.set(sessionId, abortController);

    try {
      // Build enhanced prompt with session context
      const enhancedPrompt = this.buildEnhancedPrompt(prompt, session, options);

      // Configure MCP tools if enabled
      const toolsConfig = options.enableMCPTools 
        ? this.configureMCPTools(options.customTools)
        : undefined;

      // Generate code with enhanced options
      const result = await generateRobloxCode(enhancedPrompt, {
        ...options,
        customSystemPrompt: this.buildSystemPromptWithTools(options, toolsConfig),
      }, context);

      // Update session with results
      session.updatedAt = new Date();
      if (result.success && result.files.length > 0) {
        session.context.lastGeneratedCode = result.files[0].content;
        session.context.lastGeneratedFile = result.files[0].path;
      }

      this.sessions.set(sessionId, session);
      this.activeAbortControllers.delete(sessionId);

      return {
        ...result,
        sessionId,
        sessionMessages: session.messages
      };
    } catch (error) {
      this.activeAbortControllers.delete(sessionId);
      throw error;
    }
  }

  abortGeneration(sessionId: string): boolean {
    const controller = this.activeAbortControllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeAbortControllers.delete(sessionId);
      return true;
    }
    return false;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.abortGeneration(sessionId);
  }

  private createSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createSession(sessionId: string): Session {
    return {
      id: sessionId,
      projectId: '',
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private buildEnhancedPrompt(prompt: string, session: Session, options: EnhancedGenerationOptions): string {
    let enhanced = prompt;

    // Add session context if there are previous messages
    if (session.messages.length > 1) {
      enhanced = `Previous context:\n`;
      
      // Include last few messages for context (limit to prevent token overflow)
      const recentMessages = session.messages.slice(-6, -1); // Exclude current message
      recentMessages.forEach(msg => {
        enhanced += `${msg.role}: ${msg.content.substring(0, 200)}...\n`;
      });
      
      enhanced += `\nCurrent request: ${prompt}`;
    }

    // Add context about previous code if available
    if (session.context.lastGeneratedCode) {
      enhanced += `\n\nPreviously generated code context available.`;
    }

    return enhanced;
  }

  private configureMCPTools(customTools?: string[]): any {
    const allTools = this.mcpTools.getAllTools();
    const selectedTools = customTools 
      ? allTools.filter(tool => customTools.includes(tool.name))
      : allTools;

    return {
      tools: selectedTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      })),
      handlers: Object.fromEntries(
        selectedTools.map(tool => [tool.name, tool.handler])
      )
    };
  }

  private buildSystemPromptWithTools(options: EnhancedGenerationOptions, toolsConfig?: any): string {
    let systemPrompt = `You are an expert Roblox developer assistant with access to specialized tools.

Core capabilities:
- Generate optimized Roblox Lua code
- Analyze code for performance and security issues
- Convert between script types (server/client/module)
- Provide API documentation and best practices
`;

    if (options.enableMCPTools && toolsConfig) {
      systemPrompt += `\n\nAvailable MCP Tools:\n`;
      toolsConfig.tools.forEach((tool: any) => {
        systemPrompt += `- ${tool.name}: ${tool.description}\n`;
      });
      
      systemPrompt += `\nUse these tools when appropriate to enhance code quality and provide better assistance.`;
    }

    systemPrompt += `\n\nAlways follow Roblox best practices:
- Use task.wait() instead of wait()
- Implement proper error handling with pcall
- Follow FilteringEnabled security principles
- Optimize for mobile performance
- Use type annotations with --!strict when requested`;

    return systemPrompt;
  }

  // Export session data for persistence
  exportSessions(): string {
    const data = {
      sessions: Array.from(this.sessions.values()),
      exportedAt: new Date()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import session data
  importSessions(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        parsed.sessions.forEach((session: any) => {
          this.sessions.set(session.id, {
            id: session.id,
            projectId: session.projectId,
            scriptId: session.scriptId,
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            context: session.context,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          });
        });
      }
    } catch (error) {
      console.error("Failed to import sessions:", error);
    }
  }

  // Get MCP tool results for analysis
  async analyzeCodeWithTools(code: string, scriptType: RobloxScriptType) {
    const analyses = await Promise.all([
      this.mcpTools.getTool('analyze_roblox_services')?.handler({ code }),
      this.mcpTools.getTool('analyze_performance')?.handler({ code }),
      this.mcpTools.getTool('validate_remotes')?.handler({ code, scriptType })
    ]);

    return {
      services: analyses[0],
      performance: analyses[1],
      remotes: analyses[2]
    };
  }
}