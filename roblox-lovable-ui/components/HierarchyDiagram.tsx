"use client";

import React from 'react';

interface HierarchyDiagramProps {
  hierarchy: string;
}

export default function HierarchyDiagram({ hierarchy }: HierarchyDiagramProps) {
  if (!hierarchy || hierarchy.trim() === '') {
    return null;
  }

  // Parse hierarchy string into structured data
  const parseHierarchy = (text: string): React.ReactElement[] => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      // Service level (📦)
      if (line.startsWith('📦')) {
        elements.push(
          <div key={index} className="font-semibold text-gray-900 dark:text-white mb-2 mt-4 first:mt-0">
            {line}
          </div>
        );
      }
      // Child items (└─)
      else if (line.includes('└─')) {
        const content = line.replace(/^\s*└─\s*/, '');
        let icon = '📄';
        let colorClass = 'text-gray-600 dark:text-gray-400';
        
        // Determine icon and color based on content
        if (content.includes('📁')) {
          icon = '';
          colorClass = 'text-blue-600 dark:text-blue-400';
        } else if (content.includes('🔌')) {
          icon = '';
          colorClass = 'text-purple-600 dark:text-purple-400';
        } else if (content.includes('(Part)')) {
          icon = '🟦';
          colorClass = 'text-cyan-600 dark:text-cyan-400';
        } else if (content.includes('(Tool)')) {
          icon = '🔧';
          colorClass = 'text-orange-600 dark:text-orange-400';
        } else if (content.includes('(Model)')) {
          icon = '🏗️';
          colorClass = 'text-green-600 dark:text-green-400';
        }
        
        elements.push(
          <div key={index} className={`ml-6 mb-1 ${colorClass} flex items-center gap-2`}>
            {icon && <span className="text-sm">{icon}</span>}
            <span className="font-mono text-sm">{content}</span>
          </div>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🗂️</span>
        <span>Required Explorer Structure</span>
      </h3>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 font-mono text-sm">
        <div className="space-y-1">
          {parseHierarchy(hierarchy)}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p className="flex items-start gap-1">
          <span>💡</span>
          <span>Create this exact structure in your Explorer window. Names must match exactly!</span>
        </p>
      </div>
    </div>
  );
}