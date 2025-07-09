import * as fs from 'fs/promises';
import * as path from 'path';
import { GeneratedFile } from './types.js';

export interface WriteOptions {
  outputDir: string;
  createDirectories?: boolean;
  overwrite?: boolean;
}

export async function writeGeneratedFiles(
  files: GeneratedFile[], 
  options: WriteOptions
): Promise<{ success: boolean; writtenFiles: string[]; errors?: string[] }> {
  const writtenFiles: string[] = [];
  const errors: string[] = [];
  
  // Ensure output directory exists
  if (options.createDirectories !== false) {
    try {
      await fs.mkdir(options.outputDir, { recursive: true });
    } catch (error) {
      errors.push(`Failed to create output directory: ${error}`);
      return { success: false, writtenFiles, errors };
    }
  }
  
  for (const file of files) {
    const fullPath = path.join(options.outputDir, file.path);
    const fileDir = path.dirname(fullPath);
    
    try {
      // Create subdirectories if needed
      if (options.createDirectories !== false) {
        await fs.mkdir(fileDir, { recursive: true });
      }
      
      // Check if file exists and handle overwrite option
      if (!options.overwrite) {
        try {
          await fs.access(fullPath);
          errors.push(`File already exists: ${fullPath} (use overwrite option to replace)`);
          continue;
        } catch {
          // File doesn't exist, we can write it
        }
      }
      
      // Write the file
      await fs.writeFile(fullPath, file.content, 'utf8');
      writtenFiles.push(fullPath);
      
    } catch (error) {
      errors.push(`Failed to write ${fullPath}: ${error}`);
    }
  }
  
  return {
    success: errors.length === 0,
    writtenFiles,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function createRobloxProject(
  projectName: string,
  outputDir: string
): Promise<{ success: boolean; error?: string }> {
  const projectStructure = {
    'src': {
      'server': {},
      'client': {},
      'shared': {}
    },
    'assets': {},
    'tests': {}
  };
  
  try {
    // Create project root
    const projectPath = path.join(outputDir, projectName);
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create directory structure
    for (const [dir, subdirs] of Object.entries(projectStructure)) {
      const dirPath = path.join(projectPath, dir);
      await fs.mkdir(dirPath, { recursive: true });
      
      for (const subdir of Object.keys(subdirs)) {
        await fs.mkdir(path.join(dirPath, subdir), { recursive: true });
      }
    }
    
    // Create a basic README
    const readmeContent = `# ${projectName}

A Roblox game project generated with Claude Code.

## Structure

- \`src/server/\` - Server-side scripts
- \`src/client/\` - Client-side LocalScripts  
- \`src/shared/\` - Shared ModuleScripts
- \`assets/\` - Game assets
- \`tests/\` - Test scripts

## Usage

1. Install Rojo: \`cargo install rojo\`
2. Start Rojo server: \`rojo serve\`
3. Connect from Roblox Studio using the Rojo plugin

## Generated with

This project was generated using the Roblox Claude Code Generator.
`;
    
    await fs.writeFile(
      path.join(projectPath, 'README.md'), 
      readmeContent, 
      'utf8'
    );
    
    return { success: true };
    
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to create project structure: ${error}` 
    };
  }
}