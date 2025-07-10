// Project Management Types

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  tags?: string[];
  settings?: ProjectSettings;
}

export interface ProjectSettings {
  theme?: 'light' | 'dark';
  autoSave?: boolean;
  defaultScriptType?: 'server' | 'client' | 'module';
}

export interface Script {
  id: string;
  projectId: string;
  name: string;
  content: string;
  type: 'server' | 'client' | 'module';
  path?: string; // e.g., "ServerScriptService/GameLogic"
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedPrompt?: string;
  metadata?: ScriptMetadata;
}

export interface ScriptMetadata {
  description?: string;
  dependencies?: string[];
  requiredServices?: string[];
  tags?: string[];
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  version: number;
  content: string;
  changelog?: string;
  createdAt: Date;
  source: 'initial' | 'chat' | 'manual' | 'template';
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail?: string;
  scripts: TemplateScript[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  downloads?: number;
  rating?: number;
}

export interface TemplateScript {
  name: string;
  type: 'server' | 'client' | 'module';
  content: string;
  path?: string;
  description?: string;
}

export type TemplateCategory = 
  | 'game-mechanics'
  | 'player-systems' 
  | 'ui-systems'
  | 'economy'
  | 'combat'
  | 'social'
  | 'admin'
  | 'utilities'
  | 'effects'
  | 'data';

export interface Session {
  id: string;
  projectId: string;
  scriptId?: string;
  messages: SessionMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Project management state
export interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  currentScript: Script | null;
  scripts: Script[];
  isLoading: boolean;
  error: string | null;
}

// Export/Import formats
export interface ProjectExport {
  version: string;
  project: Project;
  scripts: Script[];
  createdAt: Date;
}

export interface RobloxStudioExport {
  type: 'rbxlx' | 'rbxl' | 'rbxm';
  content: string | Blob;
  filename: string;
}