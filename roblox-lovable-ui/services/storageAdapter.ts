import { Project, Script } from '@/types/project';
import { ProjectStorageService } from './projectStorage';
import { DatabaseService } from './databaseService';
import { createClient } from '@/lib/supabase/client';

/**
 * Storage adapter that switches between local storage and database
 * based on authentication status
 */
export class StorageAdapter {
  private static async isAuthenticated(): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  // Projects
  static async getAllProjects(): Promise<Project[]> {
    try {
      if (await this.isAuthenticated()) {
        return DatabaseService.getProjects();
      }
      return ProjectStorageService.getAllProjects();
    } catch (error) {
      console.error('Error in StorageAdapter.getAllProjects:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        authenticated: await this.isAuthenticated()
      });
      // Return empty array to prevent app crash
      return [];
    }
  }

  static async getProject(id: string): Promise<Project | null> {
    if (await this.isAuthenticated()) {
      return DatabaseService.getProject(id);
    }
    return ProjectStorageService.getProject(id);
  }

  static async createProject(name: string, description?: string): Promise<Project> {
    if (await this.isAuthenticated()) {
      const project = await DatabaseService.createProject(name, description);
      if (!project) throw new Error('Failed to create project');
      return project;
    }
    return ProjectStorageService.createProject(name, description);
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    if (await this.isAuthenticated()) {
      return DatabaseService.updateProject(id, updates);
    }
    return ProjectStorageService.updateProject(id, updates);
  }

  static async deleteProject(id: string): Promise<boolean> {
    if (await this.isAuthenticated()) {
      return DatabaseService.deleteProject(id);
    }
    return ProjectStorageService.deleteProject(id);
  }

  // Scripts
  static async getProjectScripts(projectId: string): Promise<Script[]> {
    try {
      if (await this.isAuthenticated()) {
        return DatabaseService.getScripts(projectId);
      }
      return ProjectStorageService.getProjectScripts(projectId);
    } catch (error) {
      console.error('Error in StorageAdapter.getProjectScripts:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        authenticated: await this.isAuthenticated()
      });
      // Return empty array to prevent app crash
      return [];
    }
  }

  static async getScript(id: string): Promise<Script | null> {
    if (await this.isAuthenticated()) {
      return DatabaseService.getScript(id);
    }
    return ProjectStorageService.getScript(id);
  }

  static async createScript(
    projectId: string,
    name: string,
    type: 'server' | 'client' | 'module',
    content: string = '',
    metadata?: any
  ): Promise<Script> {
    if (await this.isAuthenticated()) {
      const script = await DatabaseService.createScript(projectId, name, type, content, metadata);
      if (!script) throw new Error('Failed to create script');
      return script;
    }
    return ProjectStorageService.createScript(projectId, name, type, content, metadata);
  }

  static async updateScript(id: string, updates: Partial<Script>): Promise<Script | null> {
    if (await this.isAuthenticated()) {
      return DatabaseService.updateScript(id, updates);
    }
    return ProjectStorageService.updateScript(id, updates);
  }

  static async deleteScript(id: string): Promise<boolean> {
    if (await this.isAuthenticated()) {
      return DatabaseService.deleteScript(id);
    }
    return ProjectStorageService.deleteScript(id);
  }

  // Current Project (always local for quick access)
  static getCurrentProjectId(): string | null {
    return ProjectStorageService.getCurrentProjectId();
  }

  static setCurrentProject(projectId: string): void {
    ProjectStorageService.setCurrentProject(projectId);
  }

  // Migration
  static async migrateToDatabase(): Promise<boolean> {
    return DatabaseService.migrateFromLocalStorage();
  }

  // Export/Import
  static async exportProject(projectId: string): Promise<string> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const scripts = await this.getProjectScripts(projectId);
    
    return ProjectStorageService.exportProject(projectId);
  }

  static async importProject(exportData: string): Promise<Project> {
    // Always import to current storage method
    if (await this.isAuthenticated()) {
      // Parse the export and create in database
      const parsed = JSON.parse(exportData);
      const project = await DatabaseService.createProject(parsed.project.name, parsed.project.description);
      if (!project) throw new Error('Failed to import project');

      // Import scripts
      for (const script of parsed.scripts) {
        await DatabaseService.createScript(
          project.id,
          script.name,
          script.type,
          script.content,
          script.metadata
        );
      }

      return project;
    }
    
    return ProjectStorageService.importProject(exportData);
  }

  // Tracking (only for authenticated users)
  static async trackUsage(action: string, resourceId?: string, metadata?: any): Promise<void> {
    if (await this.isAuthenticated()) {
      await DatabaseService.trackUsage(action, resourceId, metadata);
    }
  }

  static async trackGeneration(scriptId: string, prompt: string, tokens: number, responseTime: number): Promise<void> {
    if (await this.isAuthenticated()) {
      await DatabaseService.trackGeneration(scriptId, prompt, tokens, responseTime);
    }
  }
}