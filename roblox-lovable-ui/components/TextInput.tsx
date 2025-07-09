"use client";

import { useState, useRef, useEffect } from "react";

interface TextInputProps {
  onGenerate: (prompt: string, scriptType: 'server' | 'client' | 'module') => void;
  isGenerating: boolean;
}

export default function TextInput({ onGenerate, isGenerating }: TextInputProps) {
  const [prompt, setPrompt] = useState("");
  const [scriptType, setScriptType] = useState<'server' | 'client' | 'module'>('server');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = [
    "Create a racing game with checkpoints and a timer...",
    "Build a shop system where players can buy items with coins...",
    "Make a door that opens when players get close...",
    "Create a weapon system with different damage types...",
    "Build a day/night cycle that changes every 5 minutes...",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim(), scriptType);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Script Type Selector */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setScriptType('server')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            scriptType === 'server'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          🖥️ Server Script
        </button>
        <button
          type="button"
          onClick={() => setScriptType('client')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            scriptType === 'client'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          👤 Client Script
        </button>
        <button
          type="button"
          onClick={() => setScriptType('module')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            scriptType === 'module'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          📦 Module Script
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`
            relative rounded-2xl transition-all duration-300
            ${isFocused 
              ? 'shadow-2xl shadow-purple-500/10 scale-[1.02]' 
              : 'shadow-lg hover:shadow-xl'
            }
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/25 via-pink-400/25 to-blue-400/25 rounded-2xl blur-lg opacity-70"></div>
          
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholders[placeholderIndex]}
              rows={3}
              className="w-full px-6 py-4 pr-32 text-lg bg-transparent border-0 outline-none resize-none min-h-[120px] max-h-[300px] placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-white transition-all duration-300"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">
                Press Enter to generate
              </span>
              
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                  ${prompt.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 text-white hover:from-orange-600 hover:via-pink-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }
                `}
                title={isGenerating ? "Generating code..." : !prompt.trim() ? "Enter a prompt" : "Generate code"}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Generate</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl mb-1">🎮</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">Game Scripts</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Server & Client</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl mb-1">🏗️</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">Build Systems</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Complex Mechanics</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl mb-1">✨</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">UI & Effects</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">GUIs & Animations</div>
        </div>
      </div>
    </div>
  );
}