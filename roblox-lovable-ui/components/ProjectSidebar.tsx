"use client";

import { useState, useEffect } from "react";
import { Project, Script } from "@/types/project";
import { StorageAdapter } from "@/services/storageAdapter";

interface ProjectSidebarProps {
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onScriptSelect: (script: Script) => void;
  onCreateProject: () => void;
  onCreateScript: () => void;
  currentScript: Script | null;
}

export default function ProjectSidebar({
  currentProject,
  onProjectSelect,
  onScriptSelect,
  onCreateProject,
  onCreateScript,
  currentScript
}: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (currentProject) {
      loadProjectScripts(currentProject.id);
      setExpandedProjects(prev => new Set([...prev, currentProject.id]));
    }
  }, [currentProject]);

  const loadProjects = async () => {
    const allProjects = await StorageAdapter.getAllProjects();
    setProjects(allProjects);
  };

  const loadProjectScripts = async (projectId: string) => {
    const projectScripts = await StorageAdapter.getProjectScripts(projectId);
    setScripts(projectScripts);
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getScriptIcon = (type: 'server' | 'client' | 'module') => {
    switch (type) {
      case 'server':
        return '🖥️';
      case 'client':
        return '👤';
      case 'module':
        return '📦';
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-3">Projects</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* New Project Button */}
          <button
            onClick={onCreateProject}
            className="w-full px-3 py-2 mb-2 text-left text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>

          {/* Projects */}
          {filteredProjects.map(project => {
            const isExpanded = expandedProjects.has(project.id);
            const projectScripts = scripts.filter(s => s.projectId === project.id);
            
            return (
              <div key={project.id} className="mb-1">
                <div
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                    currentProject?.id === project.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => {
                    onProjectSelect(project);
                    toggleProjectExpanded(project.id);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg 
                      className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="text-xs opacity-60">
                    {projectScripts.length}
                  </span>
                </div>

                {/* Scripts */}
                {isExpanded && currentProject?.id === project.id && (
                  <div className="ml-4 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateScript();
                      }}
                      className="w-full px-3 py-1.5 mb-1 text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Script
                    </button>

                    {projectScripts.map(script => (
                      <div
                        key={script.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onScriptSelect(script);
                        }}
                        className={`px-3 py-1.5 rounded text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                          currentScript?.id === script.id
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span>{getScriptIcon(script.type)}</span>
                        <span className="truncate">{script.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}