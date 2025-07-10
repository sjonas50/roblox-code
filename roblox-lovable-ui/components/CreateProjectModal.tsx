"use client";

import { useState } from "react";
import { ProjectStorageService } from "@/services/projectStorage";
import { TemplateService } from "@/services/templateService";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const templates = TemplateService.getAllTemplates();

  const handleCreate = async () => {
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    
    try {
      // Create project
      const project = ProjectStorageService.createProject(projectName, description);
      
      // If template selected, add template scripts to project
      if (selectedTemplate) {
        const template = TemplateService.getTemplate(selectedTemplate);
        if (template) {
          for (const templateScript of template.scripts) {
            ProjectStorageService.createScript(
              project.id,
              templateScript.name,
              templateScript.type,
              templateScript.content,
              {
                description: templateScript.description,
                fromTemplate: template.name
              }
            );
          }
        }
      }
      
      onProjectCreated(project.id);
      handleClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setDescription("");
    setSelectedTemplate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Project</h2>
        
        {/* Project Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Awesome Game"
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your project..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start with a Template (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            <div
              onClick={() => setSelectedTemplate("")}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTemplate === ""
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <h4 className="font-medium text-white mb-1">Blank Project</h4>
              <p className="text-xs text-gray-400">Start from scratch</p>
            </div>
            
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName.trim() || isCreating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}