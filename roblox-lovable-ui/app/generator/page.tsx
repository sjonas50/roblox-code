"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import TextInput from "@/components/TextInput";
import GradientBackground from "@/components/GradientBackground";
import CodeOutput from "@/components/CodeOutput";
import ChatPanel from "@/components/ChatPanel";
import MultiAgentProgress from "@/components/MultiAgentProgress";
import ProjectDashboard from "@/components/ProjectDashboard";
import WelcomeScreen from "@/components/WelcomeScreen";
import { RobloxTask, AgentProgress } from "@/utils/multiAgentOrchestrator";
import { ProjectStorageService } from "@/services/projectStorage";

export default function GeneratorPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [filename, setFilename] = useState("");
  const [messages, setMessages] = useState<Array<{ type: string; content: string; timestamp: Date }>>([]);
  const [currentScriptType, setCurrentScriptType] = useState<'server' | 'client' | 'module'>('server');
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMultiAgent, setIsMultiAgent] = useState(false);
  const [agentTasks, setAgentTasks] = useState<RobloxTask[]>([]);
  const [agentProgress, setAgentProgress] = useState<AgentProgress[]>([]);

  useEffect(() => {
    // Check if user has existing projects or a current project
    const projects = ProjectStorageService.getAllProjects();
    const savedProjectId = ProjectStorageService.getCurrentProjectId();
    
    if (savedProjectId || projects.length > 0) {
      setShowWelcome(false);
      setCurrentProjectId(savedProjectId);
    }
  }, []);

  const handleWelcomeComplete = (projectId?: string) => {
    setShowWelcome(false);
    if (projectId) {
      setCurrentProjectId(projectId);
      ProjectStorageService.setCurrentProject(projectId);
    }
  };

  const handleGenerate = async (prompt: string, scriptType: 'server' | 'client' | 'module' = 'server') => {
    console.log("🚀 Starting generation for prompt:", prompt, "scriptType:", scriptType);
    setIsGenerating(true);
    setGeneratedCode(""); // Clear previous code
    setMessages([]); // Clear previous messages
    setCurrentScriptType(scriptType); // Store current script type
    setCurrentPrompt(prompt); // Store current prompt
    setIsMultiAgent(false); // Reset multi-agent state
    setAgentTasks([]); // Clear agent tasks
    setAgentProgress([]); // Clear agent progress
    
    // Safety timeout to re-enable button after 60 seconds for complex requests
    const safetyTimeout = setTimeout(() => {
      console.warn("Generation timeout - re-enabling button");
      setIsGenerating(false);
    }, 60000);
    
    // Add initial message
    setMessages(prev => [...prev, {
      type: 'info',
      content: `Starting ${scriptType} script generation for: "${prompt}"`,
      timestamp: new Date()
    }]);

    try {
      // Use intelligent orchestration that analyzes requests with Claude
      const response = await fetch('/api/generate-intelligent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          scriptType
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("✅ Stream complete");
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log("📦 Received data:", data);
              
              switch (data.type) {
                case 'analysis':
                  // Handle intelligent analysis result
                  if (data.requiresMultiAgent) {
                    setIsMultiAgent(true);
                    setMessages(prev => [...prev, {
                      type: 'info',
                      content: `Analysis: ${data.reasoning} (${data.complexity} complexity)`,
                      timestamp: new Date()
                    }]);
                  }
                  break;
                  
                case 'tasks':
                  // Handle dynamic task breakdown
                  if (data.tasks && data.tasks.length > 0) {
                    setAgentTasks(data.tasks.map((t: any) => ({
                      ...t,
                      status: 'pending',
                      scriptType: scriptType,
                      type: t.specialization || 'general',
                      priority: 'medium',
                      estimatedComplexity: t.estimatedTurns || 3
                    })));
                    setMessages(prev => [...prev, {
                      type: 'info',
                      content: `Breaking down into ${data.tasks.length} specialized tasks`,
                      timestamp: new Date()
                    }]);
                  }
                  break;
                  
                case 'task-start':
                  // Task starting
                  setAgentProgress(prev => [...prev, {
                    taskId: data.taskId,
                    agentType: data.specialization || 'general',
                    status: 'in_progress',
                    message: `Starting: ${data.title}`,
                    timestamp: new Date()
                  }]);
                  setAgentTasks(prev => prev.map(task => 
                    task.id === data.taskId 
                      ? { ...task, status: 'in_progress' }
                      : task
                  ));
                  break;
                  
                case 'task-complete':
                  // Task completed
                  setAgentProgress(prev => [...prev, {
                    taskId: data.taskId,
                    agentType: 'general',
                    status: data.success ? 'completed' : 'failed',
                    message: data.success ? 'Task completed' : 'Task failed',
                    timestamp: new Date()
                  }]);
                  setAgentTasks(prev => prev.map(task => 
                    task.id === data.taskId 
                      ? { ...task, status: data.success ? 'completed' : 'failed' }
                      : task
                  ));
                  break;
                  
                case 'code':
                  setGeneratedCode(data.code);
                  setFilename(data.filename || 'script.lua');
                  setMessages(prev => [...prev, {
                    type: 'success',
                    content: `Generated code: ${data.filename}`,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'done':
                  // Only show success message if we have generated code
                  if (generatedCode) {
                    setMessages(prev => [...prev, {
                      type: 'success',
                      content: 'Generation complete!',
                      timestamp: new Date()
                    }]);
                  }
                  // Always ensure button is re-enabled
                  setIsGenerating(false);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Generation error:", error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: error instanceof Error ? error.message : 'Failed to generate code',
        timestamp: new Date()
      }]);
    } finally {
      clearTimeout(safetyTimeout);
      setIsGenerating(false);
      console.log("✅ Generation complete - button re-enabled");
    }
  };

  const handleCodeUpdate = (newCode: string, description?: string) => {
    console.log('🔄 handleCodeUpdate called:');
    console.log('  - New code length:', newCode?.length || 0);
    console.log('  - Description:', description);
    console.log('  - Current code length:', generatedCode?.length || 0);
    
    if (newCode && newCode.trim()) {
      console.log('  ✅ Setting new generated code');
      // First update the code
      setGeneratedCode(newCode);
      
      // Then add the success message with a small delay to ensure proper ordering
      setTimeout(() => {
        const successMessage = {
          type: 'success',
          content: description || 'Code updated successfully!',
          timestamp: new Date()
        };
        console.log('  📝 Adding success message:', successMessage.content);
        setMessages(prev => {
          console.log('  📊 Previous messages count:', prev.length);
          return [...prev, successMessage];
        });
      }, 100); // Small delay to ensure code update happens first
    } else {
      console.log('  ❌ Code is empty or whitespace only');
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <ProjectDashboard 
      onGenerateCode={handleGenerate}
      isGenerating={isGenerating}
      messages={messages}
      generatedCode={generatedCode}
    />
  );
}