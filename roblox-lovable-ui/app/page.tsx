"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import TextInput from "@/components/TextInput";
import GradientBackground from "@/components/GradientBackground";
import CodeOutput from "@/components/CodeOutput";
import ChatPanel from "@/components/ChatPanel";
import MultiAgentProgress from "@/components/MultiAgentProgress";
import { RobloxTask, AgentProgress } from "@/utils/multiAgentOrchestrator";

export default function Home() {
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

  const handleStandardGeneration = async (prompt: string, scriptType: 'server' | 'client' | 'module') => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          scriptType
        }),
      });

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
          console.log("✅ Standard generation stream complete");
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log("📦 Standard generation data:", data);
              
              switch (data.type) {
                case 'start':
                  setMessages(prev => [...prev, {
                    type: 'info',
                    content: data.message,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'assistant':
                  setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: data.message,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'code':
                  setGeneratedCode(data.code);
                  setFilename(data.filename || 'script.lua');
                  setMessages(prev => [...prev, {
                    type: 'success',
                    content: `Generated code: ${data.filename}`,
                    timestamp: new Date()
                  }]);
                  // Store all files if multi-file result
                  if (data.allFiles && data.allFiles.length > 1) {
                    setMessages(prev => [...prev, {
                      type: 'info',
                      content: `📁 Generated ${data.allFiles.length} files total. Main file displayed above.`,
                      timestamp: new Date()
                    }]);
                    console.log('Multiple files generated:', data.allFiles);
                  }
                  break;
                  
                case 'success':
                  setMessages(prev => [...prev, {
                    type: 'success',
                    content: data.message || 'Generation successful!',
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'error':
                  setMessages(prev => [...prev, {
                    type: 'error',
                    content: `Error: ${data.error}`,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'done':
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
      console.error("❌ Standard generation error:", error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: error instanceof Error ? error.message : 'Failed to generate code',
        timestamp: new Date()
      }]);
      setIsGenerating(false);
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
                  
                case 'task-error':
                  // Task error
                  setMessages(prev => [...prev, {
                    type: 'error',
                    content: `Task error: ${data.error}`,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'status':
                  // General status update
                  setMessages(prev => [...prev, {
                    type: 'info',
                    content: data.message,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'start':
                  setMessages(prev => [...prev, {
                    type: 'info',
                    content: data.message,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'assistant':
                  setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: data.message,
                    timestamp: new Date()
                  }]);
                  break;
                  
                case 'code':
                  setGeneratedCode(data.code);
                  setFilename(data.filename || 'script.lua');
                  setMessages(prev => [...prev, {
                    type: 'success',
                    content: `Generated code: ${data.filename}`,
                    timestamp: new Date()
                  }]);
                  // If we have tasks, mark them all as completed
                  if (data.tasks) {
                    setAgentTasks(data.tasks);
                  }
                  break;
                  
                case 'error':
                  setMessages(prev => [...prev, {
                    type: 'error',
                    content: `Error: ${data.error}`,
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
    console.log('Updating code from chat, length:', newCode?.length || 0);
    if (newCode && newCode.trim()) {
      setGeneratedCode(newCode);
      // Force a re-render by updating messages
      setMessages(prev => [...prev, {
        type: 'success',
        content: description || 'Code updated successfully!',
        timestamp: new Date()
      }]);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden relative">
      <GradientBackground />
      
      <div className="relative z-20 flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex-1 flex flex-col items-center justify-center">
          <HeroSection />
          <TextInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>
        
        {/* Multi-Agent Progress Display */}
        {isMultiAgent && (
          <MultiAgentProgress
            tasks={agentTasks}
            progress={agentProgress}
            isActive={isGenerating}
          />
        )}
        
        <CodeOutput 
          code={generatedCode}
          filename={filename}
          isGenerating={isGenerating}
          messages={messages}
          scriptType={currentScriptType}
          prompt={currentPrompt}
        />
      </div>

      {/* Chat Toggle Button - Show after any generation attempt */}
      {(generatedCode || messages.length > 0) && (
        <button
          onClick={() => setIsChatOpen(true)}
          className={`fixed right-4 bottom-4 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 z-40 ${
            isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          title="Chat with assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentCode={generatedCode}
        onCodeUpdate={handleCodeUpdate}
        scriptType={currentScriptType}
        originalPrompt={currentPrompt}
      />
    </main>
  );
}