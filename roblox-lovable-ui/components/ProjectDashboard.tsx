"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Project, Script } from "@/types/project";
import { ProjectStorageService } from "@/services/projectStorage";
import ProjectSidebar from "./ProjectSidebar";
import CreateProjectModal from "./CreateProjectModal";
import CreateScriptModal from "./CreateScriptModal";
import ExportModal from "./ExportModal";
import HelpModal from "./HelpModal";
import CodeOutput from "./CodeOutput";
import ChatPanel from "./ChatPanel";
import TextInput from "./TextInput";

interface ProjectDashboardProps {
  onGenerateCode: (prompt: string, scriptType: 'server' | 'client' | 'module') => void;
  isGenerating: boolean;
  messages: Array<{ type: string; content: string; timestamp: Date }>;
  generatedCode?: string;
}

export default function ProjectDashboard({ 
  onGenerateCode, 
  isGenerating,
  messages,
  generatedCode 
}: ProjectDashboardProps) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateScript, setShowCreateScript] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Update current script when code is generated
  useEffect(() => {
    if (generatedCode && currentScript) {
      handleCodeUpdate(generatedCode, currentScript.lastGeneratedPrompt);
    }
  }, [generatedCode]);

  useEffect(() => {
    // Load current project on mount
    const currentProjectId = ProjectStorageService.getCurrentProjectId();
    if (currentProjectId) {
      const project = ProjectStorageService.getProject(currentProjectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, []);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCurrentScript(null);
    ProjectStorageService.setCurrentProject(project.id);
  };

  const handleScriptSelect = (script: Script) => {
    setCurrentScript(script);
  };

  const handleProjectCreated = (projectId: string) => {
    const project = ProjectStorageService.getProject(projectId);
    if (project) {
      handleProjectSelect(project);
    }
  };

  const handleScriptCreated = (scriptId: string) => {
    const script = ProjectStorageService.getScript(scriptId);
    if (script) {
      handleScriptSelect(script);
    }
  };

  const handleGenerate = async (prompt: string, scriptType: 'server' | 'client' | 'module') => {
    if (!currentProject) {
      // Create a default project if none exists
      const project = ProjectStorageService.createProject("My First Project");
      handleProjectSelect(project);
    }

    // If no current script, create one
    if (!currentScript) {
      const newScript = ProjectStorageService.createScript(
        currentProject!.id,
        "GeneratedScript",
        scriptType,
        "",
        { lastGeneratedPrompt: prompt }
      );
      handleScriptSelect(newScript);
    }

    // Generate code for current script
    onGenerateCode(prompt, scriptType);
  };

  const handleCodeUpdate = (newCode: string, description?: string) => {
    if (currentScript) {
      const updated = ProjectStorageService.updateScript(currentScript.id, {
        content: newCode,
        lastGeneratedPrompt: description
      });
      // Update state with the new script
      if (updated) {
        setCurrentScript(updated);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <ProjectSidebar
        currentProject={currentProject}
        onProjectSelect={handleProjectSelect}
        onScriptSelect={handleScriptSelect}
        onCreateProject={() => setShowCreateProject(true)}
        onCreateScript={() => setShowCreateScript(true)}
        currentScript={currentScript}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-sm">Home</span>
            </Link>
            {currentProject && (
              <>
                <span className="text-gray-500">|</span>
                <h1 className="text-lg font-semibold text-white">
                  {currentProject.name}
                </h1>
                {currentScript && (
                  <>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-300">{currentScript.name}</span>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
              onClick={() => setShowHelp(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </button>
            <input
              type="file"
              id="import-file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const text = await file.text();
                    const imported = ProjectStorageService.importProject(text);
                    handleProjectSelect(imported);
                    window.location.reload(); // Refresh to show imported project
                  } catch (error) {
                    console.error('Import failed:', error);
                    alert('Failed to import project. Please check the file format.');
                  }
                }
              }}
            />
            <button
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              Import
            </button>
            {currentProject && (
              <>
                <button
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                  onClick={() => setShowExport(true)}
                >
                  Export
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => setShowCreateScript(true)}
                >
                  New Script
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentScript ? (
            <>
              {/* Code Generation Input */}
              <div className="p-6 border-b border-gray-800">
                <TextInput
                  onGenerate={(prompt) => handleGenerate(prompt, currentScript.type)}
                  isGenerating={isGenerating}
                />
              </div>

              {/* Code Output */}
              <div className="flex-1 overflow-y-auto p-6">
                <CodeOutput
                  code={generatedCode || currentScript.content}
                  filename={`${currentScript.name}.${currentScript.type === 'server' ? 'server' : currentScript.type === 'client' ? 'client' : ''}.lua`}
                  isGenerating={isGenerating}
                  messages={messages}
                  scriptType={currentScript.type}
                  prompt={currentScript.lastGeneratedPrompt || ''}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                {currentProject ? (
                  // Empty project state
                  <>
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-2xl font-semibold text-white mb-4">
                      Ready to start coding!
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Create your first script or use a template to get started
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <button
                        onClick={() => {
                          // Quick create server script
                          const script = ProjectStorageService.createScript(
                            currentProject.id,
                            "GameController",
                            "server",
                            "-- Game Controller\n-- Main server script\n\n-- Your code here"
                          );
                          handleScriptSelect(script);
                        }}
                        className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <div className="text-2xl mb-2">🖥️</div>
                        <h3 className="font-medium text-white mb-1">Server Script</h3>
                        <p className="text-sm text-gray-400">Game logic & security</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          // Quick create client script
                          const script = ProjectStorageService.createScript(
                            currentProject.id,
                            "PlayerController",
                            "client",
                            "-- Player Controller\n-- Client-side script\n\n-- Your code here"
                          );
                          handleScriptSelect(script);
                        }}
                        className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <div className="text-2xl mb-2">👤</div>
                        <h3 className="font-medium text-white mb-1">Client Script</h3>
                        <p className="text-sm text-gray-400">UI & player input</p>
                      </button>
                      
                      <button
                        onClick={() => setShowCreateScript(true)}
                        className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <div className="text-2xl mb-2">➕</div>
                        <h3 className="font-medium text-white mb-1">Custom Script</h3>
                        <p className="text-sm text-gray-400">Name it yourself</p>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      💡 Tip: Start with a server script for game mechanics, or a client script for UI
                    </div>
                  </>
                ) : (
                  // No project state
                  <>
                    <div className="text-6xl mb-4">🚀</div>
                    <h2 className="text-2xl font-semibold text-white mb-4">
                      Welcome to Roblox Code Generator
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Create your first project to start building amazing Roblox games
                    </p>
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
                    >
                      Create New Project
                    </button>
                    <div className="text-sm text-gray-500">
                      or <button 
                        onClick={() => setShowHelp(true)}
                        className="text-blue-400 hover:underline"
                      >
                        learn how it works
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {currentScript && (
        <>
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

          <ChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentCode={currentScript.content}
            onCodeUpdate={handleCodeUpdate}
            scriptType={currentScript.type}
            originalPrompt={currentScript.lastGeneratedPrompt || ''}
          />
        </>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
      />

      {currentProject && (
        <>
          <CreateScriptModal
            isOpen={showCreateScript}
            onClose={() => setShowCreateScript(false)}
            projectId={currentProject.id}
            onScriptCreated={handleScriptCreated}
          />
          <ExportModal
            isOpen={showExport}
            onClose={() => setShowExport(false)}
            project={currentProject}
          />
        </>
      )}
      
      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}