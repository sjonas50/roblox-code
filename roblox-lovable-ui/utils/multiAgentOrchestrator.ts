/**
 * Multi-Agent Orchestrator for handling complex Roblox game development requests
 * Uses Claude Code SDK to coordinate multiple specialized agents
 */

import { generateRobloxCode } from 'roblox-claude-codegen';
import type { RobloxScriptType, GeneratedCode } from 'roblox-claude-codegen';

// Task types for the orchestrator
export interface RobloxTask {
  id: string;
  title: string;
  description: string;
  type: 'architecture' | 'systems' | 'ui' | 'data' | 'optimization';
  scriptType: RobloxScriptType;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedComplexity: number;
  result?: GeneratedCode;
  error?: string;
  retryCount?: number;
}

export interface TaskDecomposition {
  isComplex: boolean;
  complexityScore: number;
  tasks: RobloxTask[];
  reasoning: string;
}

export interface AgentProgress {
  taskId: string;
  agentType: string;
  status: string;
  message: string;
  timestamp: Date;
}

/**
 * Analyzes request complexity and determines if multi-agent approach is needed
 */
export class RequestAnalyzer {
  private complexityKeywords = {
    high: [
      'racing game', 'rpg', 'tycoon', 'simulator', 'multiplayer',
      'complete', 'full', 'entire', 'all', 'everything',
      'with ui', 'and gui', 'leaderboard', 'data save',
      'inventory', 'shop', 'combat', 'battle'
    ],
    medium: [
      'system', 'manager', 'handler', 'controller',
      'with', 'and', 'plus', 'including',
      'checkpoint', 'timer', 'score', 'points'
    ],
    low: [
      'simple', 'basic', 'part', 'brick', 'object',
      'change', 'modify', 'update', 'fix'
    ]
  };

  /**
   * Calculates complexity score for a request
   */
  calculateComplexity(prompt: string): number {
    const lowerPrompt = prompt.toLowerCase();
    let score = 0;

    // Check for high complexity keywords
    this.complexityKeywords.high.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) score += 3;
    });

    // Check for medium complexity keywords
    this.complexityKeywords.medium.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) score += 2;
    });

    // Check for low complexity keywords (reduce score)
    this.complexityKeywords.low.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) score -= 1;
    });

    // Additional factors
    const wordCount = prompt.split(' ').length;
    if (wordCount > 30) score += 2;
    if (wordCount > 50) score += 3;

    // Check for multiple features (using "and", commas)
    const andCount = (lowerPrompt.match(/\band\b/g) || []).length;
    const commaCount = (lowerPrompt.match(/,/g) || []).length;
    score += andCount * 2 + commaCount * 1.5;

    // Reduce score if it's a relatively simple request
    if (lowerPrompt.length < 100) score -= 2;
    
    // Reduce score for asset-related requests (we can't generate visual assets)
    if (lowerPrompt.includes('asset') || lowerPrompt.includes('model')) {
      score -= 3;
    }

    // Known problematic combinations that cause JSON parsing issues
    if ((lowerPrompt.includes('racing') || lowerPrompt.includes('game')) && 
        (lowerPrompt.includes('checkpoint') || lowerPrompt.includes('timer'))) {
      score += 5; // Boost score to ensure multi-agent handling
    }

    return Math.max(0, score);
  }

  /**
   * Decomposes a complex request into tasks
   */
  decomposeRequest(prompt: string, scriptType: RobloxScriptType): TaskDecomposition {
    const complexityScore = this.calculateComplexity(prompt);
    // Lower threshold to catch requests that commonly cause JSON parsing issues
    const isComplex = complexityScore >= 8;

    if (!isComplex) {
      return {
        isComplex: false,
        complexityScore,
        tasks: [],
        reasoning: 'Request is simple enough to handle in a single generation'
      };
    }

    const tasks: RobloxTask[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Analyze what components are needed
    const needsArchitecture = this.detectArchitectureNeeds(lowerPrompt);
    const systemsNeeded = this.detectSystemsNeeds(lowerPrompt);
    const needsUI = this.detectUINeeds(lowerPrompt);
    const needsData = this.detectDataNeeds(lowerPrompt);

    // Create tasks based on analysis
    if (needsArchitecture) {
      tasks.push(this.createArchitectureTask(prompt, scriptType));
    }

    systemsNeeded.forEach((system, index) => {
      tasks.push(this.createSystemTask(system, scriptType, index));
    });

    if (needsUI) {
      tasks.push(this.createUITask(prompt, scriptType, systemsNeeded));
    }

    if (needsData) {
      tasks.push(this.createDataTask(prompt, scriptType));
    }

    // Always add optimization as final task for complex projects
    if (tasks.length > 2) {
      tasks.push(this.createOptimizationTask(scriptType));
    }

    return {
      isComplex: true,
      complexityScore,
      tasks,
      reasoning: `Complex request requiring ${tasks.length} specialized agents`
    };
  }

  private detectArchitectureNeeds(prompt: string): boolean {
    const architectureKeywords = ['game', 'system', 'framework', 'structure', 'racing'];
    return architectureKeywords.some(keyword => prompt.includes(keyword));
  }

  private detectSystemsNeeds(prompt: string): string[] {
    const systems: string[] = [];
    
    // Movement/Physics systems
    if (prompt.includes('racing') || prompt.includes('car') || prompt.includes('vehicle')) {
      systems.push('Vehicle Movement System');
    }
    if (prompt.includes('checkpoint') || prompt.includes('waypoint')) {
      systems.push('Checkpoint System');
    }
    if (prompt.includes('timer') || prompt.includes('countdown') || prompt.includes('stopwatch')) {
      systems.push('Timer System');
    }
    
    // Game mechanics
    if (prompt.includes('combat') || prompt.includes('battle') || prompt.includes('fight')) {
      systems.push('Combat System');
    }
    if (prompt.includes('inventory') || prompt.includes('items') || prompt.includes('backpack')) {
      systems.push('Inventory System');
    }
    if (prompt.includes('shop') || prompt.includes('store') || prompt.includes('purchase')) {
      systems.push('Shop System');
    }
    
    // Player systems
    if (prompt.includes('health') || prompt.includes('damage')) {
      systems.push('Health System');
    }
    if (prompt.includes('score') || prompt.includes('points') || prompt.includes('leaderboard')) {
      systems.push('Scoring System');
    }

    return systems;
  }

  private detectUINeeds(prompt: string): boolean {
    const uiKeywords = ['ui', 'gui', 'interface', 'menu', 'button', 'display', 'show', 'hud'];
    // Also check for UI needs based on game features
    const impliedUINeeds = ['timer', 'checkpoint', 'score', 'leaderboard', 'racing'];
    return uiKeywords.some(keyword => prompt.includes(keyword)) || 
           impliedUINeeds.some(keyword => prompt.includes(keyword));
  }

  private detectDataNeeds(prompt: string): boolean {
    const dataKeywords = ['save', 'load', 'data', 'persist', 'store', 'leaderboard', 'stats'];
    return dataKeywords.some(keyword => prompt.includes(keyword));
  }

  private createArchitectureTask(prompt: string, scriptType: RobloxScriptType): RobloxTask {
    return {
      id: 'arch_' + Date.now(),
      title: 'Game Architecture Setup',
      description: `Design overall structure and module organization for: ${prompt}`,
      type: 'architecture',
      scriptType: 'module',
      priority: 'high',
      dependencies: [],
      status: 'pending',
      estimatedComplexity: 5,
      retryCount: 0
    };
  }

  private createSystemTask(systemName: string, scriptType: RobloxScriptType, index: number): RobloxTask {
    return {
      id: `system_${systemName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      title: systemName,
      description: `Implement ${systemName} with proper client-server architecture`,
      type: 'systems',
      scriptType: scriptType,
      priority: index === 0 ? 'high' : 'medium',
      dependencies: index > 0 ? ['arch_*'] : [],
      status: 'pending',
      estimatedComplexity: 8,
      retryCount: 0
    };
  }

  private createUITask(prompt: string, scriptType: RobloxScriptType, systems: string[]): RobloxTask {
    return {
      id: 'ui_' + Date.now(),
      title: 'User Interface',
      description: `Create UI components for: ${systems.join(', ')}`,
      type: 'ui',
      scriptType: 'client',
      priority: 'medium',
      dependencies: systems.map(s => `system_${s.toLowerCase().replace(/\s+/g, '_')}_*`),
      status: 'pending',
      estimatedComplexity: 6,
      retryCount: 0
    };
  }

  private createDataTask(prompt: string, scriptType: RobloxScriptType): RobloxTask {
    return {
      id: 'data_' + Date.now(),
      title: 'Data Persistence',
      description: 'Implement data saving and loading system',
      type: 'data',
      scriptType: 'server',
      priority: 'medium',
      dependencies: ['system_*'],
      status: 'pending',
      estimatedComplexity: 7,
      retryCount: 0
    };
  }

  private createOptimizationTask(scriptType: RobloxScriptType): RobloxTask {
    return {
      id: 'opt_' + Date.now(),
      title: 'Code Optimization',
      description: 'Review and optimize all generated code for performance',
      type: 'optimization',
      scriptType: scriptType,
      priority: 'low',
      dependencies: ['*'],
      status: 'pending',
      estimatedComplexity: 4,
      retryCount: 0
    };
  }
}

/**
 * Orchestrates multiple agents to handle complex requests
 */
export class MultiAgentOrchestrator {
  private analyzer: RequestAnalyzer;
  private progressCallbacks: ((progress: AgentProgress) => void)[] = [];
  private maxRetries = 2;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.analyzer = new RequestAnalyzer();
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: AgentProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private emitProgress(progress: AgentProgress) {
    this.progressCallbacks.forEach(cb => {
      try {
        cb(progress);
      } catch (e) {
        console.error('Progress callback error:', e);
      }
    });
  }

  /**
   * Main entry point for handling requests
   */
  async handleRequest(
    prompt: string,
    scriptType: RobloxScriptType,
    apiKey: string
  ): Promise<{ success: boolean; result?: GeneratedCode; tasks?: RobloxTask[]; error?: string }> {
    console.log('🤖 MultiAgentOrchestrator.handleRequest called');
    console.log('📝 Prompt:', prompt);
    
    // Analyze and decompose the request
    const decomposition = this.analyzer.decomposeRequest(prompt, scriptType);
    console.log('📊 Complexity analysis:', {
      score: decomposition.complexityScore,
      isComplex: decomposition.isComplex,
      taskCount: decomposition.tasks.length,
      reasoning: decomposition.reasoning
    });

    if (!decomposition.isComplex) {
      console.log('➡️ Redirecting to simple generation (score below threshold)');
      // Simple request - use single generation
      this.emitProgress({
        taskId: 'single',
        agentType: 'general',
        status: 'in_progress',
        message: 'Processing simple request...',
        timestamp: new Date()
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
          error: error instanceof Error ? error.message : 'Failed to generate code' 
        };
      }
    }

    // Complex request - use multi-agent approach
    console.log('🚀 Using multi-agent approach');
    console.log('📋 Tasks:', decomposition.tasks.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      scriptType: t.scriptType
    })));
    
    this.emitProgress({
      taskId: 'analysis',
      agentType: 'analyzer',
      status: 'completed',
      message: `Identified ${decomposition.tasks.length} tasks to complete`,
      timestamp: new Date()
    });

    // Execute tasks with improved error handling
    const completedTasks: RobloxTask[] = [];
    const generatedFiles: { [key: string]: string } = {};
    let hasErrors = false;

    for (const task of decomposition.tasks) {
      try {
        await this.executeTaskWithRetry(task, apiKey, prompt, generatedFiles);
        completedTasks.push(task);
        
        if (task.result?.success && task.result.files.length > 0) {
          // Store generated code by task ID for systems, or by type for others
          const key = task.type === 'systems' ? task.id : task.type;
          generatedFiles[key] = task.result.files[0].content;
        } else if (task.status === 'failed') {
          hasErrors = true;
        }
      } catch (error) {
        console.error(`Failed to execute task ${task.id}:`, error);
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        hasErrors = true;
        completedTasks.push(task);
      }
    }

    // Combine all generated code
    const combinedCode = this.combineGeneratedCode(generatedFiles, decomposition.tasks);

    // Create result
    const success = !hasErrors && combinedCode.trim().length > 0;
    
    if (success) {
      const finalResult: GeneratedCode = {
        success: true,
        files: [{
          path: 'game_script.lua',
          content: combinedCode,
          type: 'lua'
        }],
        messages: [],
        metadata: {
          scriptType,
          generatedAt: new Date()
        }
      };

      return {
        success: true,
        result: finalResult,
        tasks: completedTasks
      };
    } else {
      return {
        success: false,
        tasks: completedTasks,
        error: 'Some tasks failed to complete. Check individual task errors.'
      };
    }
  }

  private async executeTaskWithRetry(
    task: RobloxTask, 
    apiKey: string, 
    originalPrompt: string,
    previousResults: { [key: string]: string }
  ): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.emitProgress({
            taskId: task.id,
            agentType: task.type,
            status: 'in_progress',
            message: `Retrying ${task.title} (attempt ${attempt + 1})...`,
            timestamp: new Date()
          });
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
        
        await this.executeTask(task, apiKey, originalPrompt, previousResults);
        return; // Success
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Task ${task.id} attempt ${attempt + 1} failed:`, error);
        
        // Check if it's a JSON parsing error
        if (error instanceof Error && error.message.includes('JSON')) {
          // Try with simpler prompt on retry
          task.description = this.simplifyTaskDescription(task);
        }
      }
    }
    
    // All retries failed
    throw lastError || new Error('Task execution failed after all retries');
  }

  private async executeTask(
    task: RobloxTask, 
    apiKey: string, 
    originalPrompt: string,
    previousResults: { [key: string]: string }
  ): Promise<void> {
    task.status = 'in_progress';
    
    this.emitProgress({
      taskId: task.id,
      agentType: task.type,
      status: 'in_progress',
      message: `Starting ${task.title}...`,
      timestamp: new Date()
    });

    try {
      // Create specialized prompt with context from previous tasks
      const specializedPrompt = this.createContextAwarePrompt(task, originalPrompt, previousResults);

      // Generate code for this specific task with more conservative settings
      const result = await generateRobloxCode(specializedPrompt, {
        scriptType: task.scriptType,
        maxTurns: 2, // Reduce turns to avoid large responses
        useTypeChecking: true,
        permissionMode: 'bypassPermissions',
        includeComments: false // Reduce output size
      });

      task.result = result;
      task.status = result.success ? 'completed' : 'failed';
      
      this.emitProgress({
        taskId: task.id,
        agentType: task.type,
        status: task.status,
        message: result.success ? `Completed ${task.title}` : `Failed ${task.title}`,
        timestamp: new Date()
      });

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.emitProgress({
        taskId: task.id,
        agentType: task.type,
        status: 'failed',
        message: `Error in ${task.title}: ${task.error}`,
        timestamp: new Date()
      });
      
      throw error; // Re-throw for retry handling
    }
  }

  private createContextAwarePrompt(
    task: RobloxTask, 
    originalPrompt: string,
    previousResults: { [key: string]: string }
  ): string {
    // Create very focused, minimal prompts to avoid JSON parsing issues
    const basePrompts = {
      architecture: `Create a simple Roblox module structure. Just the basic organization needed.`,
      systems: `Create a ${task.title} for Roblox. Keep it simple and focused on core functionality.`,
      ui: `Create basic UI elements for ${task.title}. Simple and functional.`,
      data: `Create data persistence using DataStore. Basic save/load functionality.`,
      optimization: `Minor performance improvements only. Keep changes minimal.`
    };

    let prompt = basePrompts[task.type] || task.description;
    
    // Add minimal context if dependencies exist
    if (task.dependencies.length > 0 && Object.keys(previousResults).length > 0) {
      prompt += '\n\nBuild on the existing structure but keep your response focused and concise.';
    }
    
    return prompt;
  }

  private simplifyTaskDescription(task: RobloxTask): string {
    // Simplify the task description for retry attempts
    const simpleDescriptions = {
      architecture: 'Create basic game structure',
      systems: `Create ${task.title} only`,
      ui: 'Create simple UI',
      data: 'Add basic data saving',
      optimization: 'Basic optimization only'
    };
    
    return simpleDescriptions[task.type] || 'Create basic implementation';
  }

  private combineGeneratedCode(
    generatedFiles: { [key: string]: string },
    tasks: RobloxTask[]
  ): string {
    let combinedCode = '-- Generated Roblox Game Code\n';
    combinedCode += '-- This code was generated by multiple specialized agents\n\n';
    
    // Add architecture/module code first
    if (generatedFiles.architecture) {
      combinedCode += '-- Game Architecture\n';
      combinedCode += generatedFiles.architecture + '\n\n';
    }
    
    // Add system implementations
    const systemEntries = Object.entries(generatedFiles)
      .filter(([key]) => key.startsWith('system_'));
      
    if (systemEntries.length > 0) {
      combinedCode += '-- Game Systems\n';
      systemEntries.forEach(([key, code]) => {
        const taskTitle = tasks.find(t => t.id === key)?.title || 'System';
        combinedCode += `-- ${taskTitle}\n`;
        combinedCode += code + '\n\n';
      });
    }
    
    // Add UI code
    if (generatedFiles.ui) {
      combinedCode += '-- User Interface\n';
      combinedCode += generatedFiles.ui + '\n\n';
    }
    
    // Add data persistence
    if (generatedFiles.data) {
      combinedCode += '-- Data Persistence\n';
      combinedCode += generatedFiles.data + '\n\n';
    }
    
    // Add optimizations last
    if (generatedFiles.optimization) {
      combinedCode += '-- Performance Optimizations\n';
      combinedCode += generatedFiles.optimization + '\n\n';
    }
    
    return combinedCode;
  }
}