"use client";

import { useState } from "react";
import { ProjectStorageService } from "@/services/projectStorage";

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onScriptCreated: (scriptId: string) => void;
}

export default function CreateScriptModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onScriptCreated 
}: CreateScriptModalProps) {
  const [scriptName, setScriptName] = useState("");
  const [scriptType, setScriptType] = useState<'server' | 'client' | 'module'>('server');
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!scriptName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const script = ProjectStorageService.createScript(
        projectId,
        scriptName,
        scriptType,
        `-- ${scriptName}
-- ${description || 'Generated with Roblox Code Generator'}
-- Script Type: ${scriptType}

${scriptType === 'module' ? `local ${scriptName} = {}

-- Add your module code here

return ${scriptName}` : `-- Add your ${scriptType} script code here`}`,
        {
          description,
          path
        }
      );
      
      onScriptCreated(script.id);
      handleClose();
    } catch (error) {
      console.error("Failed to create script:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setScriptName("");
    setScriptType('server');
    setPath("");
    setDescription("");
    onClose();
  };

  const getDefaultPath = () => {
    switch (scriptType) {
      case 'server':
        return 'ServerScriptService';
      case 'client':
        return 'StarterPlayer/StarterPlayerScripts';
      case 'module':
        return 'ReplicatedStorage';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create New Script</h2>
        
        {/* Script Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Script Name *
          </label>
          <input
            type="text"
            value={scriptName}
            onChange={(e) => setScriptName(e.target.value)}
            placeholder="GameController"
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Script Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Script Type *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setScriptType('server')}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                scriptType === 'server'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🖥️ Server
            </button>
            <button
              onClick={() => setScriptType('client')}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                scriptType === 'client'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              👤 Client
            </button>
            <button
              onClick={() => setScriptType('module')}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                scriptType === 'module'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              📦 Module
            </button>
          </div>
        </div>

        {/* Path */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Path (Optional)
          </label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder={getDefaultPath()}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Where this script should be placed in Roblox Studio
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this script do?"
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
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
            disabled={!scriptName.trim() || isCreating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? "Creating..." : "Create Script"}
          </button>
        </div>
      </div>
    </div>
  );
}