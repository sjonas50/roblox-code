// MCP (Model Context Protocol) Server for Roblox-specific tools
// This extends Claude Code SDK with specialized Roblox development capabilities

import { RobloxScriptType } from "roblox-claude-codegen";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

export class MCPRobloxTools {
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    this.registerTools();
  }

  private registerTools() {
    // Tool: Analyze Roblox Service Usage
    this.addTool({
      name: "analyze_roblox_services",
      description: "Analyze which Roblox services are used in the code and suggest optimizations",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to analyze" }
        },
        required: ["code"]
      },
      handler: async ({ code }: { code: string }) => {
        const services = this.extractServices(code);
        const analysis = {
          services: services,
          suggestions: this.getServiceSuggestions(services),
          securityIssues: this.checkSecurityIssues(code, services)
        };
        return analysis;
      }
    });

    // Tool: Generate Roblox Instance Hierarchy
    this.addTool({
      name: "generate_instance_hierarchy",
      description: "Generate a visual hierarchy of Roblox instances created in the code",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to analyze" }
        },
        required: ["code"]
      },
      handler: async ({ code }: { code: string }) => {
        const instances = this.extractInstanceCreation(code);
        return {
          hierarchy: this.buildHierarchy(instances),
          count: instances.length,
          types: [...new Set(instances.map(i => i.className))]
        };
      }
    });

    // Tool: Validate RemoteEvent/Function Usage
    this.addTool({
      name: "validate_remotes",
      description: "Validate RemoteEvent and RemoteFunction usage for security",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to validate" },
          scriptType: { 
            type: "string", 
            enum: ["server", "client", "module"],
            description: "The type of script"
          }
        },
        required: ["code", "scriptType"]
      },
      handler: async ({ code, scriptType }: { code: string; scriptType: RobloxScriptType }) => {
        const remotes = this.extractRemotes(code);
        const validation = this.validateRemoteUsage(remotes, scriptType);
        return validation;
      }
    });

    // Tool: Generate Roblox API Documentation Links
    this.addTool({
      name: "get_api_docs",
      description: "Get relevant Roblox API documentation links for used classes and methods",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to analyze" }
        },
        required: ["code"]
      },
      handler: async ({ code }: { code: string }) => {
        const apis = this.extractAPIUsage(code);
        return {
          apis: apis,
          docLinks: apis.map(api => ({
            name: api,
            url: `https://create.roblox.com/docs/reference/engine/classes/${api}`
          }))
        };
      }
    });

    // Tool: Performance Analysis
    this.addTool({
      name: "analyze_performance",
      description: "Analyze code for performance issues and suggest optimizations",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to analyze" }
        },
        required: ["code"]
      },
      handler: async ({ code }: { code: string }) => {
        const issues = this.findPerformanceIssues(code);
        return {
          issues: issues,
          severity: this.calculateSeverity(issues),
          optimizations: this.suggestOptimizations(issues)
        };
      }
    });

    // Tool: Convert Between Script Types
    this.addTool({
      name: "convert_script_type",
      description: "Convert code between server, client, and module script types",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The Lua code to convert" },
          fromType: { 
            type: "string", 
            enum: ["server", "client", "module"],
            description: "Current script type"
          },
          toType: { 
            type: "string", 
            enum: ["server", "client", "module"],
            description: "Target script type"
          }
        },
        required: ["code", "fromType", "toType"]
      },
      handler: async ({ code, fromType, toType }) => {
        const converted = this.convertScriptType(code, fromType, toType);
        return {
          convertedCode: converted.code,
          warnings: converted.warnings,
          requiresRemotes: converted.requiresRemotes
        };
      }
    });
  }

  private addTool(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  // Helper methods for tool implementations
  private extractServices(code: string): string[] {
    const servicePattern = /game:GetService\(["'](\w+)["']\)/g;
    const services: string[] = [];
    let match;
    
    while ((match = servicePattern.exec(code)) !== null) {
      if (!services.includes(match[1])) {
        services.push(match[1]);
      }
    }
    
    return services;
  }

  private getServiceSuggestions(services: string[]): string[] {
    const suggestions: string[] = [];
    
    if (services.includes("RunService") && !services.includes("Debris")) {
      suggestions.push("Consider using Debris service for temporary object cleanup");
    }
    
    if (services.includes("Players") && !services.includes("StarterGui")) {
      suggestions.push("If creating UI, remember to use StarterGui service");
    }
    
    return suggestions;
  }

  private checkSecurityIssues(code: string, services: string[]): string[] {
    const issues: string[] = [];
    
    // Check for common security issues
    if (code.includes("loadstring")) {
      issues.push("loadstring usage detected - this can be a security risk");
    }
    
    if (code.includes("_G.") || code.includes("shared.")) {
      issues.push("Global variable usage detected - consider using ModuleScripts instead");
    }
    
    if (services.includes("HttpService") && !code.includes("pcall")) {
      issues.push("HttpService used without error handling - wrap in pcall");
    }
    
    return issues;
  }

  private extractInstanceCreation(code: string): any[] {
    const instancePattern = /Instance\.new\(["'](\w+)["']\)/g;
    const instances: any[] = [];
    let match;
    
    while ((match = instancePattern.exec(code)) !== null) {
      instances.push({
        className: match[1],
        line: code.substring(0, match.index).split('\n').length
      });
    }
    
    return instances;
  }

  private buildHierarchy(instances: any[]): any {
    // Simple hierarchy based on common patterns
    const hierarchy: any = {
      GUI: instances.filter(i => i.className.includes("Gui") || i.className.includes("Frame")),
      Parts: instances.filter(i => i.className === "Part" || i.className === "MeshPart"),
      Effects: instances.filter(i => ["ParticleEmitter", "PointLight", "SpotLight"].includes(i.className)),
      Constraints: instances.filter(i => i.className.includes("Constraint")),
      Other: instances.filter(i => !i.className.includes("Gui") && !["Part", "MeshPart"].includes(i.className))
    };
    
    return hierarchy;
  }

  private extractRemotes(code: string): any[] {
    const remotePattern = /(RemoteEvent|RemoteFunction|BindableEvent|BindableFunction)/g;
    const remotes: any[] = [];
    let match;
    
    while ((match = remotePattern.exec(code)) !== null) {
      remotes.push({
        type: match[1],
        usage: this.determineRemoteUsage(code, match.index)
      });
    }
    
    return remotes;
  }

  private determineRemoteUsage(code: string, position: number): string {
    const before = code.substring(Math.max(0, position - 50), position);
    const after = code.substring(position, Math.min(code.length, position + 50));
    
    if (before.includes("Instance.new")) return "creation";
    if (after.includes("OnServerEvent") || after.includes("OnServerInvoke")) return "server-listener";
    if (after.includes("OnClientEvent") || after.includes("OnClientInvoke")) return "client-listener";
    if (after.includes("FireServer") || after.includes("InvokeServer")) return "client-sender";
    if (after.includes("FireClient") || after.includes("InvokeClient")) return "server-sender";
    
    return "unknown";
  }

  private validateRemoteUsage(remotes: any[], scriptType: string): any {
    const validation = {
      valid: true,
      warnings: [] as string[],
      errors: [] as string[]
    };
    
    remotes.forEach(remote => {
      if (scriptType === "client" && (remote.usage === "server-listener" || remote.usage === "server-sender")) {
        validation.errors.push(`Client script cannot use server-side ${remote.type} methods`);
        validation.valid = false;
      }
      
      if (scriptType === "server" && (remote.usage === "client-listener" || remote.usage === "client-sender")) {
        validation.errors.push(`Server script cannot use client-side ${remote.type} methods`);
        validation.valid = false;
      }
    });
    
    return validation;
  }

  private extractAPIUsage(code: string): string[] {
    const apis = new Set<string>();
    
    // Common Roblox classes
    const classPattern = /\b(Part|Model|Humanoid|Character|Player|Workspace|ReplicatedStorage|ServerStorage|StarterGui|TweenService|RunService|UserInputService|ContextActionService)\b/g;
    
    let match;
    while ((match = classPattern.exec(code)) !== null) {
      apis.add(match[1]);
    }
    
    return Array.from(apis);
  }

  private findPerformanceIssues(code: string): any[] {
    const issues: any[] = [];
    
    // Check for common performance issues
    if (/while\s+true\s+do/.test(code) && !/wait|task\.wait/.test(code)) {
      issues.push({
        type: "infinite-loop",
        description: "Infinite loop without yield",
        severity: "high"
      });
    }
    
    if (/FindFirstChild.*FindFirstChild.*FindFirstChild/.test(code)) {
      issues.push({
        type: "deep-findchild",
        description: "Deep FindFirstChild chains can be slow",
        severity: "medium"
      });
    }
    
    if (/GetChildren\(\).*#/.test(code)) {
      issues.push({
        type: "getchildren-count",
        description: "Using #GetChildren() just for count is inefficient",
        severity: "low"
      });
    }
    
    return issues;
  }

  private calculateSeverity(issues: any[]): string {
    const highCount = issues.filter(i => i.severity === "high").length;
    const mediumCount = issues.filter(i => i.severity === "medium").length;
    
    if (highCount > 0) return "high";
    if (mediumCount > 2) return "medium";
    return "low";
  }

  private suggestOptimizations(issues: any[]): string[] {
    const suggestions: string[] = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case "infinite-loop":
          suggestions.push("Add task.wait() or game:GetService('RunService').Heartbeat:Wait() in loops");
          break;
        case "deep-findchild":
          suggestions.push("Store references to frequently accessed objects");
          break;
        case "getchildren-count":
          suggestions.push("Use #parent:GetChildren() directly without storing the array");
          break;
      }
    });
    
    return suggestions;
  }

  private convertScriptType(code: string, fromType: string, toType: string): any {
    let convertedCode = code;
    const warnings: string[] = [];
    let requiresRemotes = false;
    
    if (fromType === "server" && toType === "client") {
      // Server to client conversion
      if (code.includes("game.Players.PlayerAdded")) {
        warnings.push("PlayerAdded events don't work in LocalScripts");
        requiresRemotes = true;
      }
      
      convertedCode = convertedCode.replace(
        /local Players = game:GetService\("Players"\)/,
        'local Players = game:GetService("Players")\nlocal player = Players.LocalPlayer'
      );
    }
    
    if (fromType === "client" && toType === "server") {
      // Client to server conversion
      if (code.includes("LocalPlayer")) {
        warnings.push("LocalPlayer doesn't exist on server - will need to handle multiple players");
        requiresRemotes = true;
      }
      
      convertedCode = convertedCode.replace(/Players\.LocalPlayer/g, "-- TODO: Handle for each player");
    }
    
    if (toType === "module") {
      // Convert to module
      const moduleName = "ConvertedModule";
      convertedCode = `local ${moduleName} = {}\n\n${convertedCode}\n\nreturn ${moduleName}`;
    }
    
    return { code: convertedCode, warnings, requiresRemotes };
  }

  // Export tool schemas for Claude Code SDK integration
  getToolSchemas() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }
}