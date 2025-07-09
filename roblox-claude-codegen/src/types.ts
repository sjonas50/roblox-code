import type { SDKMessage, PermissionMode } from "@anthropic-ai/claude-code";

export type RobloxScriptType = 'server' | 'client' | 'module';

export interface RobloxGenerationOptions {
  scriptType: RobloxScriptType;
  targetService?: string; // e.g., 'StarterPlayer', 'ServerScriptService', 'ReplicatedStorage'
  context?: string; // existing code context
  maxTurns?: number;
  includeComments?: boolean;
  useTypeChecking?: boolean; // for --!strict or --!nonstrict
  permissionMode?: PermissionMode; // Control file operation permissions
  customSystemPrompt?: string; // Override system prompt if needed
  allowedTools?: string[]; // Restrict tools if needed
  cwd?: string; // Working directory for operations
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'lua' | 'json' | 'toml';
}

export interface GeneratedCode {
  success: boolean;
  files: GeneratedFile[];
  messages: SDKMessage[];
  errors?: string[];
  metadata?: {
    scriptType: RobloxScriptType;
    targetService?: string;
    generatedAt: Date;
  };
}

export interface RobloxContext {
  projectName?: string;
  existingServices?: string[]; // Services already in use
  dependencies?: string[]; // Required modules or packages
  gameType?: 'obby' | 'rpg' | 'tycoon' | 'simulator' | 'other';
}

export interface SystemPromptOptions {
  scriptType: RobloxScriptType;
  context?: RobloxContext;
  additionalInstructions?: string;
}