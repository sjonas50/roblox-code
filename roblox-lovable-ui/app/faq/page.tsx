"use client";

import { useState } from "react";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    category: "General",
    question: "What is the Roblox Code Generator?",
    answer: "The Roblox Code Generator is an AI-powered development platform that helps you create Roblox scripts using natural language. Simply describe what you want to build, and the AI generates professional Lua code for your game."
  },
  {
    category: "General",
    question: "Is this free to use?",
    answer: "The platform itself is free, but you need an Anthropic API key to use the AI generation features. You can get an API key from Anthropic's website."
  },
  {
    category: "General",
    question: "What can I build with this?",
    answer: "Anything you can imagine for Roblox! Common examples include game mechanics (combat, movement, abilities), UI systems (shops, inventories, menus), economy systems, admin tools, special effects, and data persistence."
  },
  {
    category: "General",
    question: "Do I need to know how to code?",
    answer: "No! The AI handles the coding for you. However, basic understanding of Roblox Studio and where to place scripts is helpful."
  },
  
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I start my first project?",
    answer: "When you first open the app, you'll see three options: Quick Start (immediately start generating code), New Project (create an organized project), or Use Template (start with pre-built systems). Choose the option that fits your needs!"
  },
  {
    category: "Getting Started",
    question: "What's the difference between Quick Start and New Project?",
    answer: "Quick Start creates a single script immediately, perfect for testing ideas. New Project lets you organize multiple scripts, better for complete games."
  },
  {
    category: "Getting Started",
    question: "Should I use templates?",
    answer: "Templates are great for learning how systems work, getting a head start on common features, and understanding best practices. Available templates include leaderboards, teams, shops, combat systems, and more."
  },
  
  // Using the Generator
  {
    category: "Using the Generator",
    question: "How do I generate code?",
    answer: "Select or create a script in your project, type what you want in the input box (e.g., 'Create a sword that deals damage'), choose the script type (Server, Client, or Module), then click Generate or press Enter."
  },
  {
    category: "Using the Generator",
    question: "What are Server, Client, and Module scripts?",
    answer: "Server Scripts (🖥️) run on the server and handle game logic and security. Client Scripts (👤) run on each player's computer and handle UI and input. Module Scripts (📦) contain shared code that other scripts can use."
  },
  {
    category: "Using the Generator",
    question: "How detailed should my prompts be?",
    answer: "Be specific about what you want. Instead of 'Make a gun', try 'Create a laser gun that shoots red beams, deals 20 damage, has a 0.5 second cooldown, and plays a sound effect'."
  },
  
  // Code Generation
  {
    category: "Code Generation",
    question: "The AI generated code with errors. What do I do?",
    answer: "Click the chat button (bottom right), paste the error message from Roblox Studio, and the AI will fix the code and explain what was wrong."
  },
  {
    category: "Code Generation",
    question: "Can I ask the AI to modify existing code?",
    answer: "Yes! Use the chat to add features ('Add a cooldown to the sword'), fix issues ('Make this work for all players'), or optimize ('Make this more efficient')."
  },
  {
    category: "Code Generation",
    question: "Does the AI remember previous conversations?",
    answer: "Yes, within the same session. The AI remembers what code it generated, previous modifications, and the context of your project."
  },
  {
    category: "Code Generation",
    question: "Can I ask questions without changing code?",
    answer: "Yes! The chat understands when you're asking for help vs requesting changes. Examples: 'How do I implement this in Studio?' or 'Where should I put this script?'"
  },
  
  // Exporting
  {
    category: "Exporting",
    question: "How do I get my code into Roblox Studio?",
    answer: "Several options: Copy & Paste (click copy button, paste in Studio), Export as .rbxmx (download and drag into Studio), or Export as Rojo for professional workflows."
  },
  {
    category: "Exporting",
    question: "What export format should I use?",
    answer: "Beginners should use copy/paste or .rbxmx. Teams should use Rojo for version control. Use JSON for project backups."
  },
  {
    category: "Exporting",
    question: "Where do I place scripts in Roblox Studio?",
    answer: "Server Scripts go in ServerScriptService, Client Scripts go in StarterPlayer > StarterPlayerScripts, Module Scripts usually go in ReplicatedStorage. The generator adds comments telling you where each script belongs."
  },
  
  // Troubleshooting
  {
    category: "Troubleshooting",
    question: "My code isn't working in Studio",
    answer: "Common issues: Script in wrong location (check the comments), missing dependencies (some scripts work together), API Services not enabled (enable in Game Settings), or syntax errors (use chat to fix)."
  },
  {
    category: "Troubleshooting",
    question: "The generator is taking too long",
    answer: "Complex requests may take 30-60 seconds. Try breaking down complex systems into smaller parts."
  },
  {
    category: "Troubleshooting",
    question: "I lost my project",
    answer: "If you cleared browser data, always export important projects as backups. JSON exports can be reimported. Consider using Rojo for external version control."
  },
  
  // Best Practices
  {
    category: "Best Practices",
    question: "Should I generate everything at once?",
    answer: "No, it's better to generate one system at a time, test it in Studio, fix any issues, then add the next feature. This incremental approach helps catch issues early."
  },
  {
    category: "Best Practices",
    question: "How can I make my code more secure?",
    answer: "The AI follows Roblox security best practices: Server validation for important actions, never trust the client, use RemoteEvents carefully, and validate all user input."
  },
  {
    category: "Best Practices",
    question: "Any tips for better results?",
    answer: "Be specific in your prompts, use the chat for iterations, test frequently in Studio, read the generated comments, and ask questions when unsure."
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", ...Array.from(new Set(faqData.map(item => item.category)))];
  
  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-400">Everything you need to know about Roblox Code Generator</p>
          </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => {
            const globalIndex = faqData.indexOf(item);
            const isExpanded = expandedItems.has(globalIndex);
            
            return (
              <div key={globalIndex} className="bg-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpanded(globalIndex)}
                  className="w-full px-6 py-4 text-left flex items-start justify-between hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-white">{item.question}</h3>
                    {!isExpanded && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.answer}</p>
                    )}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{item.answer}</p>
                    <div className="mt-3 text-xs text-gray-500">
                      Category: {item.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No questions found matching your search.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            Still have questions?{' '}
            <Link href="/how-to-use" className="text-blue-400 hover:underline">
              Check out our How-To Guide
            </Link>
            {' '}or use the chat assistant in the generator.
          </p>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}