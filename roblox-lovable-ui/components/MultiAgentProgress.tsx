"use client";

import { useState, useEffect } from "react";
import { RobloxTask, AgentProgress } from "@/utils/multiAgentOrchestrator";

interface MultiAgentProgressProps {
  tasks: RobloxTask[];
  progress: AgentProgress[];
  isActive: boolean;
}

export default function MultiAgentProgress({ tasks, progress, isActive }: MultiAgentProgressProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskIcon = (type: string) => {
    const icons = {
      architecture: '🏗️',
      systems: '⚙️',
      ui: '🎨',
      data: '💾',
      optimization: '⚡'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getLatestProgressForTask = (taskId: string): AgentProgress | undefined => {
    return progress
      .filter(p => p.taskId === taskId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  };

  if (!isActive || tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🤖 Multi-Agent Task Breakdown</span>
            {isActive && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
                Active
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complex request detected • {tasks.length} specialized agents working
          </p>
        </div>

        <div className="p-4 space-y-3">
          {tasks.map((task, index) => {
            const latestProgress = getLatestProgressForTask(task.id);
            const isExpanded = expandedTasks.has(task.id);

            return (
              <div
                key={task.id}
                className={`rounded-lg border transition-all duration-200 ${
                  task.status === 'in_progress'
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
                }`}
              >
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {task.title}
                        <span className={`text-xs ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {task.type} agent • Priority: {task.priority}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {task.description}
                    </p>
                    
                    {task.dependencies.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Dependencies:</span> {task.dependencies.join(', ')}
                      </div>
                    )}

                    {latestProgress && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className={getStatusColor(latestProgress.status)}>
                            {latestProgress.message}
                          </span>
                          <span className="text-gray-500">
                            {latestProgress.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {task.status === 'in_progress' && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}

                    {task.error && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                        Error: {task.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progress: {tasks.filter(t => t.status === 'completed').length} / {tasks.length} tasks
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}