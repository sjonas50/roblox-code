import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Project, Script } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

type DbProject = Database['public']['Tables']['projects']['Row'];
type DbScript = Database['public']['Tables']['scripts']['Row'];

export class DatabaseService {
  private static supabase = createClient();

  // Projects
  static async createProject(name: string, description?: string): Promise<Project | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        name,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    return this.mapDbProjectToProject(data);
  }

  static async getProjects(): Promise<Project[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: user?.id
      });
      return [];
    }

    return data.map(this.mapDbProjectToProject);
  }

  static async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        projectId
      });
      return null;
    }

    // Update last accessed
    await this.supabase
      .from('projects')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', projectId);

    return this.mapDbProjectToProject(data);
  }

  static async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }

    return this.mapDbProjectToProject(data);
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  }

  // Scripts
  static async createScript(
    projectId: string,
    name: string,
    type: 'server' | 'client' | 'module',
    content: string = '',
    metadata?: any
  ): Promise<Script | null> {
    const { data, error } = await this.supabase
      .from('scripts')
      .insert({
        project_id: projectId,
        name,
        type,
        content,
        description: metadata?.description,
        last_generated_prompt: metadata?.lastGeneratedPrompt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating script:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        projectId,
        scriptName: name
      });
      return null;
    }

    return this.mapDbScriptToScript(data);
  }

  static async getScripts(projectId: string): Promise<Script[]> {
    const { data, error } = await this.supabase
      .from('scripts')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching scripts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        projectId
      });
      return [];
    }

    return data.map(this.mapDbScriptToScript);
  }

  static async getScript(scriptId: string): Promise<Script | null> {
    const { data, error } = await this.supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (error) {
      console.error('Error fetching script:', error);
      return null;
    }

    return this.mapDbScriptToScript(data);
  }

  static async updateScript(scriptId: string, updates: Partial<Script>): Promise<Script | null> {
    const updateData: any = {
      name: updates.name,
      type: updates.type,
      content: updates.content,
      last_generated_prompt: updates.lastGeneratedPrompt,
    };

    if (updates.metadata) {
      updateData.description = updates.metadata.description;
    }

    const { data, error } = await this.supabase
      .from('scripts')
      .update(updateData)
      .eq('id', scriptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating script:', error);
      return null;
    }

    // Create version if content changed
    if (updates.content) {
      await this.createCodeVersion(scriptId, updates.content, updates.lastGeneratedPrompt);
    }

    return this.mapDbScriptToScript(data);
  }

  static async deleteScript(scriptId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('scripts')
      .delete()
      .eq('id', scriptId);

    if (error) {
      console.error('Error deleting script:', error);
      return false;
    }

    return true;
  }

  // Code Versions
  static async createCodeVersion(scriptId: string, content: string, description?: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    // Get current version count
    const { count } = await this.supabase
      .from('code_versions')
      .select('*', { count: 'exact', head: true })
      .eq('script_id', scriptId);

    const versionNumber = (count || 0) + 1;

    const { error } = await this.supabase
      .from('code_versions')
      .insert({
        script_id: scriptId,
        version_number: versionNumber,
        content,
        description,
        created_by: user.id,
      });

    if (error) {
      console.error('Error creating code version:', error);
      return false;
    }

    return true;
  }

  static async getCodeVersions(scriptId: string) {
    const { data, error } = await this.supabase
      .from('code_versions')
      .select('*')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching code versions:', error);
      return [];
    }

    return data;
  }

  // Migration from localStorage
  static async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      // Check if user already has projects
      const { data: existingProjects } = await this.supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingProjects && existingProjects.length > 0) {
        console.log('User already has projects in database, skipping migration');
        return true;
      }

      // Import ProjectStorageService to access local data
      const { ProjectStorageService } = await import('./projectStorage');
      const localProjects = ProjectStorageService.getAllProjects();

      for (const localProject of localProjects) {
        // Create project in database
        const dbProject = await this.createProject(localProject.name, localProject.description);
        if (!dbProject) continue;

        // Get scripts for the project from local storage
        const localScripts = ProjectStorageService.getProjectScripts(localProject.id);
        
        // Create scripts in database
        for (const localScript of localScripts) {
          await this.createScript(
            dbProject.id,
            localScript.name,
            localScript.type,
            localScript.content,
            localScript.metadata
          );
        }
      }

      console.log('Migration completed successfully');
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }

  // Tracking
  static async trackUsage(action: string, resourceId?: string, metadata?: any): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    await this.supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        action_type: action,
        resource_id: resourceId,
        metadata,
      });
  }

  static async trackGeneration(scriptId: string, prompt: string, tokens: number, responseTime: number): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    await this.supabase
      .from('generation_sessions')
      .insert({
        user_id: user.id,
        script_id: scriptId,
        prompt,
        model_used: 'claude-3',
        tokens_used: tokens,
        response_time_ms: responseTime,
      });
  }

  // Mappers
  private static mapDbProjectToProject(dbProject: DbProject): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || undefined,
      createdAt: new Date(dbProject.created_at),
      updatedAt: new Date(dbProject.updated_at),
      tags: [],
      settings: {
        theme: 'dark',
        autoSave: true,
        defaultScriptType: 'server'
      }
    };
  }

  private static mapDbScriptToScript(dbScript: DbScript): Script {
    return {
      id: dbScript.id,
      projectId: dbScript.project_id,
      name: dbScript.name,
      type: dbScript.type,
      content: dbScript.content,
      version: 1, // We'll track versions separately in code_versions table
      createdAt: new Date(dbScript.created_at),
      updatedAt: new Date(dbScript.updated_at),
      lastGeneratedPrompt: dbScript.last_generated_prompt || undefined,
      metadata: {
        description: dbScript.description || undefined,
      },
    };
  }
}