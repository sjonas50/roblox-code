"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface CodeVersion {
  id: string;
  version: number;
  code: string;
  timestamp: Date;
  description: string;
  source: 'initial' | 'chat' | 'manual';
}

interface CodeVersionControlProps {
  versions: CodeVersion[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  filename?: string;
}

export default function CodeVersionControl({ versions, currentVersionId, onVersionChange, filename }: CodeVersionControlProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  
  const currentVersion = versions.find(v => v.id === currentVersionId) || versions[versions.length - 1];
  const previousVersion = versions[versions.findIndex(v => v.id === currentVersionId) - 1];
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };
  
  const getVersionIcon = (source: string) => {
    switch (source) {
      case 'initial':
        return '🚀';
      case 'chat':
        return '💬';
      case 'manual':
        return '✏️';
      default:
        return '📝';
    }
  };

  return (
    <div className="relative">
      {/* Version Selector Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            <svg className={`w-4 h-4 transition-transform ${showVersions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Version {currentVersion?.version || 1}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentVersion && formatTimestamp(currentVersion.timestamp)}
            </span>
          </button>
          
          {versions.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const currentIndex = versions.findIndex(v => v.id === currentVersionId);
                  if (currentIndex > 0) {
                    onVersionChange(versions[currentIndex - 1].id);
                  }
                }}
                disabled={versions.findIndex(v => v.id === currentVersionId) === 0}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous version"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const currentIndex = versions.findIndex(v => v.id === currentVersionId);
                  if (currentIndex < versions.length - 1) {
                    onVersionChange(versions[currentIndex + 1].id);
                  }
                }}
                disabled={versions.findIndex(v => v.id === currentVersionId) === versions.length - 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next version"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {previousVersion && (
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showDiff ? 'Hide changes' : 'Show changes'}
          </button>
        )}
      </div>
      
      {/* Version List Dropdown */}
      {showVersions && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {versions.map((version, index) => (
            <button
              key={version.id}
              onClick={() => {
                onVersionChange(version.id);
                setShowVersions(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                version.id === currentVersionId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              } ${index !== versions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getVersionIcon(version.source)}</span>
                    <span className="font-medium">Version {version.version}</span>
                    {version.id === currentVersionId && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{version.description}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                  {formatTimestamp(version.timestamp)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Code Display */}
      <div className="relative">
        {showDiff && previousVersion ? (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
              Changes from Version {previousVersion.version} to Version {currentVersion.version}:
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              {currentVersion.description}
            </p>
          </div>
        ) : null}
        
        {filename && (
          <div className="absolute top-2 right-2 z-10 px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-lg text-xs text-gray-300">
            {filename}
          </div>
        )}
        
        <SyntaxHighlighter
          language="lua"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: '#1e1e1e',
            padding: '1rem',
            fontSize: '14px',
            minHeight: '400px',
          }}
          showLineNumbers={true}
        >
          {currentVersion?.code || '-- No code available'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}