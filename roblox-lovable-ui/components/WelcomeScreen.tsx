"use client";

import { useState } from "react";
import { ProjectStorageService } from "@/services/projectStorage";
import { TemplateService } from "@/services/templateService";
import Header from "./Header";

interface WelcomeScreenProps {
  onComplete: (projectId?: string) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [selectedOption, setSelectedOption] = useState<'quick' | 'project' | 'template'>('quick');
  const [projectName, setProjectName] = useState("My Roblox Game");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const templates = TemplateService.getAllTemplates();

  const handleStart = () => {
    switch (selectedOption) {
      case 'quick':
        // Quick start - create a default project with one script
        const quickProject = ProjectStorageService.createProject("Quick Start Project");
        ProjectStorageService.createScript(
          quickProject.id,
          "MainScript",
          "server",
          "-- Your code will appear here",
          { description: "Main game script" }
        );
        onComplete(quickProject.id);
        break;
        
      case 'project':
        // Create empty project
        const newProject = ProjectStorageService.createProject(projectName);
        onComplete(newProject.id);
        break;
        
      case 'template':
        // Create project from template
        if (selectedTemplate) {
          const template = TemplateService.getTemplate(selectedTemplate);
          const templateProject = ProjectStorageService.createProject(
            `${projectName} (${template?.name})`,
            template?.description
          );
          
          if (template) {
            template.scripts.forEach(script => {
              ProjectStorageService.createScript(
                templateProject.id,
                script.name,
                script.type,
                script.content,
                { description: script.description, fromTemplate: template.name }
              );
            });
          }
          
          onComplete(templateProject.id);
        }
        break;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Roblox Code Generator
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered code generation for your Roblox games
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Start */}
          <div
            onClick={() => setSelectedOption('quick')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'quick'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
            <p className="text-sm text-gray-400">
              Jump right in and start generating code immediately
            </p>
          </div>

          {/* New Project */}
          <div
            onClick={() => setSelectedOption('project')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'project'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-lg font-semibold text-white mb-2">New Project</h3>
            <p className="text-sm text-gray-400">
              Create a new project to organize multiple scripts
            </p>
          </div>

          {/* From Template */}
          <div
            onClick={() => setSelectedOption('template')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'template'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">Use Template</h3>
            <p className="text-sm text-gray-400">
              Start with pre-built game systems and mechanics
            </p>
          </div>
        </div>

        {/* Options */}
        {selectedOption === 'project' && (
          <div className="mb-8 p-6 bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Game"
            />
          </div>
        )}

        {selectedOption === 'template' && (
          <div className="mb-8">
            <div className="mb-4 p-6 bg-gray-800 rounded-xl">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome Game"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h4 className="font-medium text-white mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.scripts.length} script{template.scripts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleStart}
            disabled={selectedOption === 'template' && !selectedTemplate}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Get Started
          </button>
          <button
            onClick={() => onComplete()}
            className="px-8 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check the navigation menu above for FAQ and tutorials.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}