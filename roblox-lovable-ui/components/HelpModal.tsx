"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Import the markdown content (in a real app, these would be fetched)
const FAQ_CONTENT = `# Frequently Asked Questions

## Quick Answers

### How do I generate code?
Type what you want to build and press Enter or click Generate.

### Where do I put scripts in Roblox Studio?
- Server Scripts → ServerScriptService
- Client Scripts → StarterPlayer > StarterPlayerScripts  
- Module Scripts → ReplicatedStorage

### How do I fix errors?
Click the chat button and paste the error message. The AI will fix it.

### Can I use templates?
Yes! When creating a new project, choose from templates like shops, teams, or combat systems.
`;

const HOWTO_CONTENT = `# Quick Start Guide

## Your First Script in 3 Steps

1. **Describe what you want**
   \`\`\`
   Example: "Create a part that changes color when touched"
   \`\`\`

2. **Choose script type**
   - Server: Game logic
   - Client: Player UI
   - Module: Shared code

3. **Copy to Roblox Studio**
   - Click Copy
   - Paste in the right location
   - Test your game!

## Popular Examples

### Leaderboard
\`\`\`
"Create a leaderboard with points and levels"
\`\`\`

### Shop System  
\`\`\`
"Create a shop where players can buy speed boosts with coins"
\`\`\`

### Combat
\`\`\`
"Create a sword that deals damage with cool effects"
\`\`\`
`;

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'faq' | 'examples'>('quickstart');

  if (!isOpen) return null;

  const examples = [
    {
      title: "Obby/Parkour",
      prompts: [
        "Create checkpoints that save player progress",
        "Make moving platforms that follow a path",
        "Add a timer that shows completion time"
      ]
    },
    {
      title: "Fighting Game",
      prompts: [
        "Create a combat system with combos",
        "Add special abilities with cooldowns",
        "Make a health bar UI that updates"
      ]
    },
    {
      title: "Tycoon",
      prompts: [
        "Create droppers that spawn money",
        "Make a conveyor system that collects items",
        "Add purchasable upgrades that save"
      ]
    },
    {
      title: "RPG/Adventure",
      prompts: [
        "Create an inventory system with items",
        "Add a quest system with objectives",
        "Make NPCs that give quests"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Help & Documentation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'quickstart'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quick Start
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'examples'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Example Prompts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'quickstart' && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{HOWTO_CONTENT}</ReactMarkdown>
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-gray-300">
                    Be specific! Instead of "make a shop", try "create a shop GUI with 3 items that cost coins"
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">🎯 Best Practice</h3>
                  <p className="text-sm text-gray-300">
                    Generate one feature at a time, test it, then add more. This helps catch issues early!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{FAQ_CONTENT}</ReactMarkdown>
              <div className="mt-8 space-y-4">
                <details className="bg-gray-800 rounded-lg p-4">
                  <summary className="font-semibold text-white cursor-pointer">
                    Can I generate code without knowing Lua?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    Yes! Just describe what you want in plain English. The AI handles all the coding.
                  </p>
                </details>
                <details className="bg-gray-800 rounded-lg p-4">
                  <summary className="font-semibold text-white cursor-pointer">
                    How do I connect scripts together?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    Use RemoteEvents for client-server communication. The AI automatically sets these up when needed.
                  </p>
                </details>
                <details className="bg-gray-800 rounded-lg p-4">
                  <summary className="font-semibold text-white cursor-pointer">
                    Is my code saved automatically?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    Yes! All projects and scripts are saved in your browser. Use Export to create backups.
                  </p>
                </details>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div>
              <p className="text-gray-300 mb-6">
                Copy these prompts to quickly generate common game features:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {examples.map((category, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">{category.title}</h3>
                    <div className="space-y-2">
                      {category.prompts.map((prompt, pidx) => (
                        <div
                          key={pidx}
                          className="p-3 bg-gray-700 rounded text-sm text-gray-300 hover:bg-gray-600 cursor-pointer transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(prompt);
                          }}
                        >
                          <span className="text-blue-400 mr-2">→</span>
                          {prompt}
                          <span className="text-xs text-gray-500 ml-2">(click to copy)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}