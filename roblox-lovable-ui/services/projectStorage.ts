// Local storage service for projects and scripts
import { Project, Script, ScriptVersion, Template } from '@/types/project';

const STORAGE_KEYS = {
  PROJECTS: 'roblox_projects',
  SCRIPTS: 'roblox_scripts',
  VERSIONS: 'roblox_script_versions',
  CURRENT_PROJECT: 'roblox_current_project',
  TEMPLATES: 'roblox_templates'
};

export class ProjectStorageService {
  // Projects
  static getAllProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  static getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  static createProject(name: string, description?: string): Project {
    const project: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      settings: {
        theme: 'dark',
        autoSave: true,
        defaultScriptType: 'server'
      }
    };

    const projects = this.getAllProjects();
    projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    return project;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    
    if (filtered.length === projects.length) return false;
    
    // Also delete all scripts associated with this project
    const scripts = this.getAllScripts();
    const filteredScripts = scripts.filter(s => s.projectId !== id);
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(filteredScripts));
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    return true;
  }

  // Scripts
  static getAllScripts(): Script[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : [];
  }

  static getProjectScripts(projectId: string): Script[] {
    const scripts = this.getAllScripts();
    return scripts.filter(s => s.projectId === projectId);
  }

  static getScript(id: string): Script | null {
    const scripts = this.getAllScripts();
    return scripts.find(s => s.id === id) || null;
  }

  static createScript(
    projectId: string, 
    name: string, 
    type: 'server' | 'client' | 'module',
    content: string = '',
    metadata?: any
  ): Script {
    const script: Script = {
      id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      name,
      content,
      type,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    };

    const scripts = this.getAllScripts();
    scripts.push(script);
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    
    // Create initial version
    this.createScriptVersion(script.id, content, 'initial');
    
    return script;
  }

  static updateScript(id: string, updates: Partial<Script>): Script | null {
    const scripts = this.getAllScripts();
    const index = scripts.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    const updatedScript = {
      ...scripts[index],
      ...updates,
      updatedAt: new Date()
    };
    
    // If content changed, increment version and create version record
    if (updates.content && updates.content !== scripts[index].content) {
      updatedScript.version = scripts[index].version + 1;
      this.createScriptVersion(id, updates.content, 'manual');
    }
    
    scripts[index] = updatedScript;
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    
    return scripts[index];
  }

  static deleteScript(id: string): boolean {
    const scripts = this.getAllScripts();
    const filtered = scripts.filter(s => s.id !== id);
    
    if (filtered.length === scripts.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(filtered));
    return true;
  }

  // Script Versions
  static getAllVersions(): ScriptVersion[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    return data ? JSON.parse(data) : [];
  }

  static getScriptVersions(scriptId: string): ScriptVersion[] {
    const versions = this.getAllVersions();
    return versions.filter(v => v.scriptId === scriptId);
  }

  static createScriptVersion(
    scriptId: string, 
    content: string, 
    source: 'initial' | 'chat' | 'manual' | 'template',
    changelog?: string
  ): ScriptVersion {
    const script = this.getScript(scriptId);
    if (!script) throw new Error('Script not found');

    const version: ScriptVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scriptId,
      version: script.version,
      content,
      changelog,
      createdAt: new Date(),
      source
    };

    const versions = this.getAllVersions();
    versions.push(version);
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
    
    return version;
  }

  // Current Project
  static getCurrentProjectId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  }

  static setCurrentProject(projectId: string | null): void {
    if (projectId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
    }
  }

  // Export/Import
  static exportProject(projectId: string): string {
    const project = this.getProject(projectId);
    if (!project) throw new Error('Project not found');
    
    const scripts = this.getProjectScripts(projectId);
    const versions = scripts.flatMap(s => this.getScriptVersions(s.id));
    
    const exportData = {
      version: '1.0.0',
      project,
      scripts,
      versions,
      exportedAt: new Date()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  static importProject(jsonData: string): Project {
    const data = JSON.parse(jsonData);
    
    // Create new project with new ID
    const project = this.createProject(
      `${data.project.name} (Imported)`,
      data.project.description
    );
    
    // Import scripts with new IDs
    const scriptIdMap = new Map<string, string>();
    
    data.scripts.forEach((script: Script) => {
      const newScript = this.createScript(
        project.id,
        script.name,
        script.type,
        script.content,
        script.metadata
      );
      scriptIdMap.set(script.id, newScript.id);
    });
    
    // Import versions with mapped script IDs
    if (data.versions) {
      data.versions.forEach((version: ScriptVersion) => {
        const newScriptId = scriptIdMap.get(version.scriptId);
        if (newScriptId) {
          this.createScriptVersion(
            newScriptId,
            version.content,
            version.source,
            version.changelog
          );
        }
      });
    }
    
    return project;
  }

  // Clear all data
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.SCRIPTS);
    localStorage.removeItem(STORAGE_KEYS.VERSIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  }
}