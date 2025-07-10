"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import TutorialDisplay from "./TutorialDisplay";
import { generateTutorial, Tutorial } from "@/utils/tutorialGenerator";
import { validateLuauSyntax, autoFixLuauSyntax, formatSyntaxError, ValidationResult } from "@/utils/luauSyntaxChecker";
import CodeVersionControl, { CodeVersion } from "./CodeVersionControl";

interface CodeOutputProps {
  code: string;
  filename?: string;
  isGenerating: boolean;
  messages: Array<{ type: string; content: string; timestamp: Date }>;
  scriptType?: 'server' | 'client' | 'module';
  prompt?: string;
}

export default function CodeOutput({ code, filename, isGenerating, messages, scriptType = 'server', prompt = '' }: CodeOutputProps) {
  console.log('🎬 CodeOutput component rendered with:');
  console.log('  - code length:', code?.length || 0);
  console.log('  - filename:', filename);
  console.log('  - isGenerating:', isGenerating);
  console.log('  - messages count:', messages.length);
  console.log('  - scriptType:', scriptType);
  
  const [activeTab, setActiveTab] = useState<'code' | 'logs' | 'tutorial'>('code');
  const [copied, setCopied] = useState(false);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [displayCode, setDisplayCode] = useState(code);
  const [isFixed, setIsFixed] = useState(false);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  
  // Generate tutorial when code is available
  useEffect(() => {
    if (code && scriptType && prompt) {
      const generatedTutorial = generateTutorial(code, scriptType, prompt);
      setTutorial(generatedTutorial);
    }
  }, [code, scriptType, prompt]);
  
  // Create new version when code changes
  useEffect(() => {
    console.log('🔄 CodeOutput useEffect triggered:');
    console.log('  - Code prop length:', code?.length || 0);
    console.log('  - Code prop first 100 chars:', code?.substring(0, 100));
    console.log('  - Current versions count:', versions.length);
    console.log('  - Messages count:', messages.length);
    
    if (code && code.trim()) {
      // Check if this is a new version (not already in versions)
      const lastVersion = versions[versions.length - 1];
      console.log('  - Last version code length:', lastVersion?.code?.length || 0);
      console.log('  - Codes are equal?', lastVersion?.code === code);
      
      if (!lastVersion || lastVersion.code !== code) {
        console.log('  ✅ Creating new version', versions.length + 1);
        
        // Get description from latest message
        const latestMessage = messages[messages.length - 1];
        console.log('  - Latest message:', latestMessage?.content);
        
        const newVersion: CodeVersion = {
          id: Date.now().toString(),
          version: versions.length + 1,
          code: code,
          timestamp: new Date(),
          description: versions.length === 0 
            ? `Initial ${scriptType} script generation` 
            : latestMessage?.content || 'Updated via chat',
          source: versions.length === 0 ? 'initial' : 'chat'
        };
        
        console.log('  💾 New version details:', {
          id: newVersion.id,
          version: newVersion.version,
          codeLength: newVersion.code.length,
          description: newVersion.description,
          source: newVersion.source
        });
        
        setVersions(prev => {
          console.log('  📊 Setting versions, previous count:', prev.length);
          return [...prev, newVersion];
        });
        setCurrentVersionId(newVersion.id);
        setDisplayCode(code);
      } else {
        console.log('  ⚠️ Skipping version creation - code unchanged');
      }
      
      // Validate the code
      const result = validateLuauSyntax(code);
      setValidation(result);
      setIsFixed(false);
      setShowErrors(false);
      
      // Show errors automatically if there are any
      if (!result.isValid) {
        setShowErrors(true);
      }
    } else {
      console.log('  ❌ Code is empty or whitespace only');
    }
  }, [code, scriptType, versions, messages]);

  const getCurrentVersionCode = () => {
    const currentVersion = versions.find(v => v.id === currentVersionId);
    return currentVersion?.code || displayCode || code || '';
  };

  const handleCopy = async () => {
    try {
      const currentCode = getCurrentVersionCode();
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const currentCode = getCurrentVersionCode();
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'roblox-script.lua';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleAutoFix = () => {
    if (!validation || validation.isValid) return;
    
    const currentCode = getCurrentVersionCode();
    const result = autoFixLuauSyntax(currentCode);
    
    if (result.fixedCode) {
      // Create a new version with the fixed code
      const newVersion: CodeVersion = {
        id: Date.now().toString(),
        version: versions.length + 1,
        code: result.fixedCode,
        timestamp: new Date(),
        description: 'Auto-fixed syntax errors',
        source: 'manual'
      };
      
      setVersions(prev => [...prev, newVersion]);
      setCurrentVersionId(newVersion.id);
      setDisplayCode(result.fixedCode);
      setIsFixed(true);
      
      // Re-validate the fixed code
      const newValidation = validateLuauSyntax(result.fixedCode);
      setValidation(newValidation);
    }
  };

  if (!code && !isGenerating && messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Generated Code
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Generation Process
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
            {code && tutorial && (
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'tutorial'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📖 How to Use
              </button>
            )}
          </div>
          
          {activeTab === 'code' && code && (
            <div className="flex items-center gap-2">
              {validation && !validation.isValid && !showErrors && (
                <button
                  onClick={() => setShowErrors(true)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{validation.errors.length} Error{validation.errors.length > 1 ? 's' : ''}</span>
                </button>
              )}
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === 'code' ? (
            <div>
              {/* Syntax Validation Panel */}
              {validation && !validation.isValid && showErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                        Syntax Errors Found ({validation.errors.length})
                      </h3>
                      <div className="space-y-1 text-xs">
                        {validation.errors.slice(0, 3).map((error, idx) => (
                          <div key={idx} className="text-red-700 dark:text-red-400">
                            • Line {error.line}: {error.message}
                            {error.suggestion && (
                              <span className="text-red-600 dark:text-red-500 ml-1">
                                ({error.suggestion})
                              </span>
                            )}
                          </div>
                        ))}
                        {validation.errors.length > 3 && (
                          <div className="text-red-600 dark:text-red-500">
                            ... and {validation.errors.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAutoFix}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Auto-Fix
                      </button>
                      <button
                        onClick={() => setShowErrors(false)}
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Success Message for Fixed Code */}
              {isFixed && validation?.isValid && (
                <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Syntax errors fixed! The code is now ready to use.</span>
                  </div>
                </div>
              )}
              
              {/* Code Display with Version Control */}
              {isGenerating && !code ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">Generating Roblox code...</span>
                  </div>
                </div>
              ) : (versions.length > 0 || code) ? (
                <CodeVersionControl
                  versions={versions}
                  currentVersionId={currentVersionId}
                  onVersionChange={(versionId) => {
                    setCurrentVersionId(versionId);
                    const version = versions.find(v => v.id === versionId);
                    if (version) {
                      setDisplayCode(version.code);
                      // Re-validate when switching versions
                      const result = validateLuauSyntax(version.code);
                      setValidation(result);
                      setShowErrors(result.isValid ? false : true);
                    }
                  }}
                  filename={filename}
                />
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No code generated yet
                </div>
              )}
            </div>
          ) : activeTab === 'logs' ? (
            <div className="max-h-[600px] overflow-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No generation logs yet
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      msg.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : msg.type === 'assistant'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs opacity-60">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{msg.content}</span>
                    </div>
                  </div>
                ))
              )}
              
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Claude is thinking...</span>
                </div>
              )}
            </div>
          ) : activeTab === 'tutorial' && tutorial ? (
            <TutorialDisplay tutorial={tutorial} />
          ) : null}
        </div>
      </div>
    </div>
  );
}