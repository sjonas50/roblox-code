// Export service for converting projects to various formats
import { Project, Script } from '@/types/project';
import { ProjectStorageService } from './projectStorage';

export class ExportService {
  // Export as Roblox Model File (.rbxmx)
  static async exportAsRobloxModel(projectId: string): Promise<string> {
    const project = ProjectStorageService.getProject(projectId);
    if (!project) throw new Error('Project not found');
    
    const scripts = ProjectStorageService.getProjectScripts(projectId);
    
    // Create RBXMX XML structure
    let xml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
  <Meta name="ExportedFrom">Roblox Code Generator</Meta>
  <Meta name="ProjectName">${this.escapeXml(project.name)}</Meta>
  <Item class="Folder" referent="RBX0">
    <Properties>
      <string name="Name">${this.escapeXml(project.name)}</string>
    </Properties>\n`;

    // Add scripts as children
    scripts.forEach((script, index) => {
      const className = this.getScriptClassName(script.type);
      const refId = `RBX${index + 1}`;
      
      xml += `    <Item class="${className}" referent="${refId}">
      <Properties>
        <string name="Name">${this.escapeXml(script.name)}</string>
        <ProtectedString name="Source"><![CDATA[${script.content}]]></ProtectedString>
        <bool name="Disabled">false</bool>
      </Properties>
    </Item>\n`;
    });

    xml += `  </Item>
</roblox>`;

    return xml;
  }

  // Export as Rojo project
  static exportAsRojoProject(projectId: string): { files: Map<string, string>, projectJson: string } {
    const project = ProjectStorageService.getProject(projectId);
    if (!project) throw new Error('Project not found');
    
    const scripts = ProjectStorageService.getProjectScripts(projectId);
    const files = new Map<string, string>();
    
    // Create folder structure
    const structure: any = {
      name: project.name,
      tree: {
        $className: "DataModel",
        ServerScriptService: {
          $className: "ServerScriptService",
          [project.name]: {
            $path: "src/server"
          }
        },
        StarterPlayer: {
          $className: "StarterPlayer",
          StarterPlayerScripts: {
            $className: "StarterPlayerScripts",
            [project.name]: {
              $path: "src/client"
            }
          }
        },
        ReplicatedStorage: {
          $className: "ReplicatedStorage",
          [project.name]: {
            $path: "src/shared"
          }
        }
      }
    };

    // Sort scripts by type and create files
    scripts.forEach(script => {
      let folder = 'src/';
      switch (script.type) {
        case 'server':
          folder += 'server/';
          break;
        case 'client':
          folder += 'client/';
          break;
        case 'module':
          folder += 'shared/';
          break;
      }
      
      const fileName = `${script.name}.lua`;
      files.set(folder + fileName, script.content);
    });

    // Add default.project.json
    const projectJson = JSON.stringify(structure, null, 2);
    
    return { files, projectJson };
  }

  // Export as ZIP file with all scripts
  static async exportAsZip(projectId: string): Promise<Blob> {
    const { files, projectJson } = this.exportAsRojoProject(projectId);
    
    // Note: In a real implementation, you'd use a library like JSZip
    // For now, we'll create a simple tar-like format
    let content = '';
    
    // Add project file
    content += `=== default.project.json ===\n${projectJson}\n\n`;
    
    // Add all script files
    files.forEach((fileContent, filePath) => {
      content += `=== ${filePath} ===\n${fileContent}\n\n`;
    });
    
    return new Blob([content], { type: 'text/plain' });
  }

  // Import from JSON backup
  static importFromJSON(jsonData: string): Project {
    return ProjectStorageService.importProject(jsonData);
  }

  // Import from file upload
  static async importFromFile(file: File): Promise<Project> {
    const text = await file.text();
    
    if (file.name.endsWith('.json')) {
      return this.importFromJSON(text);
    }
    
    throw new Error('Unsupported file format');
  }

  // Generate README.md for the project
  static generateReadme(projectId: string): string {
    const project = ProjectStorageService.getProject(projectId);
    if (!project) throw new Error('Project not found');
    
    const scripts = ProjectStorageService.getProjectScripts(projectId);
    
    let readme = `# ${project.name}\n\n`;
    
    if (project.description) {
      readme += `${project.description}\n\n`;
    }
    
    readme += `## Scripts\n\n`;
    readme += `This project contains ${scripts.length} script${scripts.length !== 1 ? 's' : ''}:\n\n`;
    
    // Group scripts by type
    const serverScripts = scripts.filter(s => s.type === 'server');
    const clientScripts = scripts.filter(s => s.type === 'client');
    const moduleScripts = scripts.filter(s => s.type === 'module');
    
    if (serverScripts.length > 0) {
      readme += `### Server Scripts\n`;
      serverScripts.forEach(script => {
        readme += `- **${script.name}** - ${script.metadata?.description || 'Server-side logic'}\n`;
      });
      readme += '\n';
    }
    
    if (clientScripts.length > 0) {
      readme += `### Client Scripts\n`;
      clientScripts.forEach(script => {
        readme += `- **${script.name}** - ${script.metadata?.description || 'Client-side logic'}\n`;
      });
      readme += '\n';
    }
    
    if (moduleScripts.length > 0) {
      readme += `### Module Scripts\n`;
      moduleScripts.forEach(script => {
        readme += `- **${script.name}** - ${script.metadata?.description || 'Shared module'}\n`;
      });
      readme += '\n';
    }
    
    readme += `## Installation\n\n`;
    readme += `1. Open Roblox Studio\n`;
    readme += `2. Import the scripts to their respective locations:\n`;
    readme += `   - Server scripts → ServerScriptService\n`;
    readme += `   - Client scripts → StarterPlayer > StarterPlayerScripts\n`;
    readme += `   - Module scripts → ReplicatedStorage\n\n`;
    
    readme += `## Generated with\n\n`;
    readme += `This project was created using [Roblox Code Generator](https://github.com/sjonas50/roblox-code)\n`;
    
    return readme;
  }

  // Helper functions
  private static getScriptClassName(type: 'server' | 'client' | 'module'): string {
    switch (type) {
      case 'server':
        return 'Script';
      case 'client':
        return 'LocalScript';
      case 'module':
        return 'ModuleScript';
    }
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}