import { Tutorial } from "@/utils/tutorialGenerator";
import HierarchyDiagram from "./HierarchyDiagram";
import { useState } from "react";

interface TutorialDisplayProps {
  tutorial: Tutorial;
}

export default function TutorialDisplay({ tutorial }: TutorialDisplayProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  
  const handleCopySnippet = async (snippet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(index);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {tutorial.title}
        </h2>
        
        {/* Quick Setup */}
        {tutorial.quickSetup && tutorial.quickSetup.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-4">
            <div className="space-y-1">
              {tutorial.quickSetup.map((item, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Overview with Markdown-style rendering */}
        <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {tutorial.overview.split('\n').map((line, idx) => {
            if (line.includes('**')) {
              const parts = line.split(/\*\*(.*?)\*\*/);
              return (
                <div key={idx}>
                  {parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
              );
            }
            return <div key={idx}>{line}</div>;
          })}
        </div>
      </div>

      {/* Visual Hierarchy */}
      {tutorial.hierarchy && <HierarchyDiagram hierarchy={tutorial.hierarchy} />}

      {/* Prerequisites */}
      {tutorial.prerequisites.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📋 Prerequisites
          </h3>
          <div className="space-y-1">
            {tutorial.prerequisites.map((prereq, index) => (
              <div key={index} className="text-blue-700 dark:text-blue-400 flex items-start">
                {prereq.startsWith('   ') ? (
                  <span className="ml-6 text-sm font-mono">{prereq.trim()}</span>
                ) : (
                  <span>{prereq}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          📚 Step-by-Step Instructions
        </h3>
        {tutorial.steps.map((step) => (
          <div
            key={step.step}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {step.step}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {step.description}
                </p>
                
                {/* Checklist */}
                {step.checklist && step.checklist.length > 0 && (
                  <div className="mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="space-y-2">
                      {step.checklist.map((item, index) => (
                        <label key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded border-gray-300 dark:border-gray-600"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Code Snippet */}
                {step.codeSnippet && (
                  <div className="mb-3">
                    <div className="bg-gray-900 rounded-lg p-3 relative group">
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        <code>{step.codeSnippet}</code>
                      </pre>
                      <button
                        onClick={() => handleCopySnippet(step.codeSnippet!, step.step)}
                        className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedSnippet === step.step ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💡 Copy and run this in the command bar (View → Command Bar)
                    </p>
                  </div>
                )}
                
                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {step.tips.map((tip, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2">💡</span>
                        <span className="text-gray-500 dark:text-gray-400">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Warning */}
                {step.warning && (
                  <div className="mt-2 flex items-start text-sm">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{step.warning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testing */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
          🧪 Testing Your Script
        </h3>
        <ul className="space-y-2">
          {tutorial.testing.map((test, index) => (
            <li key={index} className="text-green-700 dark:text-green-400 flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span className="text-sm">{test}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Troubleshooting */}
      {tutorial.troubleshooting && tutorial.troubleshooting.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-300 mb-3">
            🔧 Troubleshooting
          </h3>
          <div className="space-y-3">
            {tutorial.troubleshooting.map((item, index) => (
              <details key={index} className="group">
                <summary className="cursor-pointer font-medium text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-sm">▶</span>
                    <span>{item.issue}</span>
                  </span>
                </summary>
                <div className="mt-2 ml-6 text-red-700 dark:text-red-500 text-sm">
                  <span className="font-medium">Solution:</span> {item.solution}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
          📎 Quick Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium block text-gray-700 dark:text-gray-300">Script Location:</span>
            <span className="text-xs">{getQuickLocation(tutorial)}</span>
          </div>
          <div>
            <span className="font-medium block text-gray-700 dark:text-gray-300">Script Type:</span>
            <span className="text-xs">{getScriptType(tutorial)}</span>
          </div>
          <div>
            <span className="font-medium block text-gray-700 dark:text-gray-300">Key Shortcuts:</span>
            <span className="text-xs">F9 - Dev Console | Ctrl+S - Save | F5 - Play</span>
          </div>
          <div>
            <span className="font-medium block text-gray-700 dark:text-gray-300">Help Resources:</span>
            <span className="text-xs">
              <a href="https://create.roblox.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Roblox Docs
              </a>
              {' | '}
              <a href="https://devforum.roblox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                DevForum
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getQuickLocation(tutorial: Tutorial): string {
  // Extract location from steps
  const createStep = tutorial.steps.find(s => s.title.includes("Create the"));
  if (createStep && createStep.checklist && createStep.checklist.length > 0) {
    // Extract from checklist which is more specific
    const locationItem = createStep.checklist.find(item => 
      item.includes('Navigate to') || item.includes('Right-click')
    );
    if (locationItem) {
      const match = locationItem.match(/(?:Navigate to|on your|in)\s+([^,\.]+)/);
      if (match) return match[1].trim();
    }
  }
  if (createStep) {
    const match = createStep.description.match(/(?:Place it in|placed in|Place this (?:script|LocalScript|ModuleScript) in)\s+([^.]+)/);
    if (match) return match[1].trim();
  }
  return "See instructions above";
}

function getScriptType(tutorial: Tutorial): string {
  if (tutorial.title.includes("Server") || tutorial.steps.some(s => s.title.includes("Server Script"))) return "Script";
  if (tutorial.title.includes("Local") || tutorial.steps.some(s => s.title.includes("Local Script"))) return "LocalScript";
  if (tutorial.title.includes("Module") || tutorial.steps.some(s => s.title.includes("Module Script"))) return "ModuleScript";
  return "Script";
}