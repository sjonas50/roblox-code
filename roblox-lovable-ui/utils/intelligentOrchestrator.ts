/**
 * Intelligent Multi-Agent Orchestrator using Claude Code SDK
 * Uses Claude's understanding to analyze requests and coordinate agents dynamically
 */

import { generateRobloxCode } from 'roblox-claude-codegen';
import type { RobloxScriptType, GeneratedCode } from 'roblox-claude-codegen';

export interface AnalysisResult {
  requiresMultiAgent: boolean;
  reasoning: string;
  suggestedApproach: 'simple' | 'multi-agent' | 'iterative';
  estimatedComplexity: 'low' | 'medium' | 'high' | 'very-high';
  components: string[];
  tasks?: DynamicTask[];
}

export interface DynamicTask {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  estimatedTurns: number;
  specialization: string;
}

export class IntelligentOrchestrator {
  private progressCallbacks: ((update: any) => void)[] = [];

  onProgress(callback: (update: any) => void) {
    this.progressCallbacks.push(callback);
  }

  private emitProgress(update: any) {
    this.progressCallbacks.forEach(cb => {
      try {
        cb(update);
      } catch (e) {
        console.error('Progress callback error:', e);
      }
    });
  }

  /**
   * Use Claude to analyze the request and determine the best approach
   */
  async analyzeRequest(
    prompt: string,
    scriptType: RobloxScriptType,
    apiKey: string
  ): Promise<AnalysisResult> {
    console.log('🧠 Using Claude to analyze request...');
    
    const analysisPrompt = `
You are analyzing a Roblox game development request to determine the best approach.

Request: "${prompt}"
Script Type: ${scriptType}

Analyze this request and provide a structured analysis:

1. Does this require multiple specialized agents? Consider:
   - Number of distinct systems/features needed
   - Interdependencies between components
   - Overall complexity and scope
   - Risk of large response causing parsing issues

2. What components/systems are needed?
   - List each major component or system
   - Identify if they can be built independently

3. If multi-agent is recommended, suggest task breakdown:
   - Each task should be focused and achievable
   - Consider dependencies between tasks
   - Estimate complexity of each task

Respond with a JSON object containing:
{
  "requiresMultiAgent": boolean,
  "reasoning": "explanation of your decision",
  "suggestedApproach": "simple" | "multi-agent" | "iterative",
  "estimatedComplexity": "low" | "medium" | "high" | "very-high",
  "components": ["list", "of", "components"],
  "tasks": [
    {
      "id": "unique_id",
      "title": "Task Title",
      "description": "What this task accomplishes",
      "dependencies": ["other_task_ids"],
      "estimatedTurns": number,
      "specialization": "architecture|gameplay|ui|data|optimization|integration"
    }
  ]
}`;

    try {
      // Use Claude Code SDK to analyze
      const result = await generateRobloxCode(analysisPrompt, {
        scriptType: 'module', // Analysis doesn't generate actual code
        maxTurns: 1,
        permissionMode: 'bypassPermissions',
        customSystemPrompt: 'You are an expert at analyzing Roblox game development requests and determining optimal implementation strategies.'
      });

      if (result.success && result.files && result.files.length > 0) {
        // Extract JSON from the generated response
        const content = result.files[0].content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          try {
            const analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
            console.log('📊 Analysis complete:', analysis);
            return analysis;
          } catch (e) {
            console.error('Failed to parse analysis JSON:', e);
          }
        }
      }

      // Fallback if analysis fails
      return {
        requiresMultiAgent: false,
        reasoning: 'Unable to analyze request, falling back to simple generation',
        suggestedApproach: 'simple',
        estimatedComplexity: 'medium',
        components: []
      };

    } catch (error) {
      console.error('Analysis error:', error);
      // Conservative fallback - use multi-agent for safety
      return {
        requiresMultiAgent: true,
        reasoning: 'Analysis failed, using multi-agent approach for safety',
        suggestedApproach: 'multi-agent',
        estimatedComplexity: 'high',
        components: ['core-gameplay', 'user-interface', 'game-systems']
      };
    }
  }

  /**
   * Main orchestration entry point
   */
  async orchestrate(
    prompt: string,
    scriptType: RobloxScriptType,
    apiKey: string
  ): Promise<{ success: boolean; result?: GeneratedCode; error?: string }> {
    // First, analyze the request
    const analysis = await this.analyzeRequest(prompt, scriptType, apiKey);
    
    this.emitProgress({
      type: 'analysis',
      requiresMultiAgent: analysis.requiresMultiAgent,
      complexity: analysis.estimatedComplexity,
      reasoning: analysis.reasoning,
      taskCount: analysis.tasks?.length || 0
    });

    if (!analysis.requiresMultiAgent) {
      // Simple generation
      return this.handleSimpleGeneration(prompt, scriptType, apiKey);
    }

    // Multi-agent generation
    return this.handleMultiAgentGeneration(prompt, scriptType, apiKey, analysis);
  }

  private async handleSimpleGeneration(
    prompt: string,
    scriptType: RobloxScriptType,
    apiKey: string
  ): Promise<{ success: boolean; result?: GeneratedCode; error?: string }> {
    console.log('📝 Using simple generation approach');
    
    this.emitProgress({
      type: 'status',
      message: 'Generating code in a single pass...'
    });

    try {
      const result = await generateRobloxCode(prompt, {
        scriptType,
        maxTurns: 3,
        useTypeChecking: true,
        permissionMode: 'bypassPermissions'
      });

      return { success: result.success, result };
    } catch (error) {
      console.error('Simple generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }

  private async handleMultiAgentGeneration(
    prompt: string,
    scriptType: RobloxScriptType,
    apiKey: string,
    analysis: AnalysisResult
  ): Promise<{ success: boolean; result?: GeneratedCode; error?: string }> {
    console.log('🤖 Using multi-agent approach');
    
    if (!analysis.tasks || analysis.tasks.length === 0) {
      // Generate tasks dynamically if not provided
      analysis.tasks = await this.generateDynamicTasks(prompt, analysis.components, apiKey);
    }

    this.emitProgress({
      type: 'tasks',
      tasks: analysis.tasks
    });

    const results: Map<string, GeneratedCode> = new Map();
    const completedTasks: string[] = [];

    // Execute tasks respecting dependencies
    for (const task of analysis.tasks) {
      // Check dependencies
      const canExecute = task.dependencies.every(dep => completedTasks.includes(dep));
      if (!canExecute) {
        console.warn(`Skipping task ${task.id} due to unmet dependencies`);
        continue;
      }

      this.emitProgress({
        type: 'task-start',
        taskId: task.id,
        title: task.title
      });

      try {
        const taskResult = await this.executeTask(task, prompt, scriptType, apiKey, results);
        results.set(task.id, taskResult);
        completedTasks.push(task.id);

        this.emitProgress({
          type: 'task-complete',
          taskId: task.id,
          success: taskResult.success
        });

      } catch (error) {
        console.error(`Task ${task.id} failed:`, error);
        this.emitProgress({
          type: 'task-error',
          taskId: task.id,
          error: error instanceof Error ? error.message : 'Task failed'
        });
      }
    }

    // Combine results
    const combinedResult = this.combineResults(results, scriptType);
    return {
      success: combinedResult.success,
      result: combinedResult
    };
  }

  private async generateDynamicTasks(
    prompt: string,
    components: string[],
    apiKey: string
  ): Promise<DynamicTask[]> {
    console.log('🎯 Generating dynamic task breakdown...');
    
    const taskPrompt = `
Based on this Roblox game request: "${prompt}"

And these identified components: ${components.join(', ')}

Create a task breakdown for implementing this with multiple specialized agents. Each task should:
- Be focused on a specific aspect
- Be achievable in 1-3 conversation turns
- Have clear dependencies if needed
- Use appropriate specialization

Respond with a JSON array of tasks.`;

    try {
      const result = await generateRobloxCode(taskPrompt, {
        scriptType: 'module',
        maxTurns: 1,
        permissionMode: 'bypassPermissions'
      });

      if (result.success && result.files && result.files.length > 0) {
        const content = result.files[0].content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse tasks JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate dynamic tasks:', error);
    }

    // Fallback tasks based on components
    return components.map((component, index) => ({
      id: `task_${index}`,
      title: `Implement ${component}`,
      description: `Create the ${component} for the game`,
      dependencies: index > 0 ? [`task_${index - 1}`] : [],
      estimatedTurns: 2,
      specialization: 'gameplay'
    }));
  }

  private async executeTask(
    task: DynamicTask,
    originalPrompt: string,
    scriptType: RobloxScriptType,
    apiKey: string,
    previousResults: Map<string, GeneratedCode>
  ): Promise<GeneratedCode> {
    // Build context from previous results
    let context = `Original request: "${originalPrompt}"\n\n`;
    context += `Current task: ${task.title}\n`;
    context += `Description: ${task.description}\n\n`;

    if (task.dependencies.length > 0 && previousResults.size > 0) {
      context += `Previous components completed:\n`;
      task.dependencies.forEach(depId => {
        if (previousResults.has(depId)) {
          context += `- ${depId} completed successfully\n`;
        }
      });
      context += '\nBuild upon the existing structure but focus only on your specific task.\n';
    }

    const taskPrompt = `${context}\n\nImplement this specific component for a Roblox game. Keep your implementation focused and concise.`;

    return generateRobloxCode(taskPrompt, {
      scriptType,
      maxTurns: task.estimatedTurns,
      useTypeChecking: true,
      permissionMode: 'bypassPermissions',
      customSystemPrompt: this.getSpecializationPrompt(task.specialization)
    });
  }

  private getSpecializationPrompt(specialization: string): string {
    const prompts: Record<string, string> = {
      architecture: 'You are a Roblox game architecture specialist. Focus on clean, modular design.',
      gameplay: 'You are a Roblox gameplay programmer. Implement engaging game mechanics.',
      ui: 'You are a Roblox UI/UX developer. Create intuitive user interfaces.',
      data: 'You are a Roblox data systems expert. Implement robust data handling.',
      optimization: 'You are a Roblox performance engineer. Optimize for smooth gameplay.',
      integration: 'You are a Roblox systems integrator. Connect components seamlessly.'
    };

    return prompts[specialization] || prompts.gameplay;
  }

  private combineResults(
    results: Map<string, GeneratedCode>,
    scriptType: RobloxScriptType
  ): GeneratedCode {
    const combinedFiles: any[] = [];
    const allMessages: any[] = [];
    let success = true;

    // Combine all results
    for (const [taskId, result] of results) {
      if (!result.success) {
        success = false;
      }
      
      if (result.files) {
        result.files.forEach(file => {
          // Prefix filename with task for organization
          combinedFiles.push({
            ...file,
            path: file.path.includes('/') ? file.path : `${taskId}/${file.path}`
          });
        });
      }

      if (result.messages) {
        allMessages.push(...result.messages);
      }
    }

    // Create a main script that ties everything together
    const mainScript = this.generateMainScript(combinedFiles, scriptType);
    combinedFiles.unshift({
      path: 'MainGame.lua',
      content: mainScript,
      type: 'lua'
    });

    return {
      success,
      files: combinedFiles,
      messages: allMessages,
      metadata: {
        scriptType,
        generatedAt: new Date()
      }
    };
  }

  private generateMainScript(files: any[], scriptType: RobloxScriptType): string {
    let mainScript = `-- Main Game Script
-- Generated by Multi-Agent Orchestrator
-- This script coordinates all game components

`;

    // Add requires for module scripts
    const moduleFiles = files.filter(f => f.path.includes('.lua') && !f.path.includes('.server.') && !f.path.includes('.client.'));
    if (moduleFiles.length > 0) {
      mainScript += '-- Load modules\n';
      moduleFiles.forEach(file => {
        const moduleName = file.path.replace(/\//g, '_').replace('.lua', '');
        mainScript += `local ${moduleName} = require(script.${moduleName})\n`;
      });
      mainScript += '\n';
    }

    mainScript += `-- Initialize game systems
local function initializeGame()
    print("Initializing game systems...")
    
    -- TODO: Initialize each component
    -- Components are organized in separate files
    -- Review each file for specific initialization needs
end

-- Start the game
initializeGame()
`;

    return mainScript;
  }
}