"use client";

import { useState } from "react";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: {
    title: string;
    content: string;
    code?: string;
    tip?: string;
  }[];
}

const tutorials: Tutorial[] = [
  {
    id: "first-script",
    title: "Creating Your First Interactive Part",
    description: "Learn the basics by making a part that players can interact with",
    difficulty: "beginner",
    steps: [
      {
        title: "Generate the Code",
        content: "Start by describing what you want in plain English:",
        code: "Create a red part in the workspace that turns green when touched and gives the player 10 points",
        tip: "Be specific about colors, sizes, and behaviors"
      },
      {
        title: "Understanding the Generated Code",
        content: "The AI will generate code that creates a part, sets its properties, and handles touch events. Look for key elements like Instance.new(), BrickColor, and the Touched event connection."
      },
      {
        title: "Customizing with Chat",
        content: "Click the chat button and ask for modifications:",
        code: "Make the part float up and down",
        tip: "The chat remembers your code, so you can ask for incremental changes"
      },
      {
        title: "Testing in Studio",
        content: "Copy the code, paste it in ServerScriptService, and run your game to see it in action!"
      }
    ]
  },
  {
    id: "shop-system",
    title: "Building a Simple Shop",
    description: "Create a shop where players can buy items with coins",
    difficulty: "beginner",
    steps: [
      {
        title: "Start with a Template",
        content: "Create a new project and choose the 'Shop System' template. This gives you a foundation with items and purchase logic."
      },
      {
        title: "Customize the Shop Items",
        content: "Use the chat to add new items:",
        code: "Add a speed boost item that costs 50 coins and lasts 30 seconds",
        tip: "The AI understands context from the template"
      },
      {
        title: "Create the Shop GUI",
        content: "Create a new Client Script and generate the UI:",
        code: "Create a shop GUI that shows the items from the shop system with buy buttons"
      },
      {
        title: "Test the Integration",
        content: "Place the server script in ServerScriptService and client script in StarterGui. They'll communicate automatically through RemoteEvents!"
      }
    ]
  },
  {
    id: "team-game",
    title: "Building a Team-Based Game",
    description: "Create a capture-the-flag style game with teams",
    difficulty: "intermediate",
    steps: [
      {
        title: "Set Up Teams",
        content: "Use the Team System template for auto-balancing teams"
      },
      {
        title: "Add Team Spawns",
        content: "Generate spawn locations:",
        code: "Create team spawn locations that teleport players to their team's base when they join"
      },
      {
        title: "Create the Flag System",
        content: "Generate the core game mechanic:",
        code: "Create a flag system where each team has a flag. When a player touches the enemy flag, they carry it. If they bring it to their base, their team scores"
      },
      {
        title: "Add Scoring",
        content: "Use chat to enhance:",
        code: "Add a leaderboard that shows team scores and announce when a team scores"
      }
    ]
  },
  {
    id: "combat-system",
    title: "Combat System with Weapons",
    description: "Create a sword fighting game with damage and effects",
    difficulty: "advanced",
    steps: [
      {
        title: "Generate Sword Tool",
        content: "Create a server script for the weapon:",
        code: "Create a sword tool that deals 20 damage with a slash animation, has a 1 second cooldown, and shows damage numbers"
      },
      {
        title: "Add Combat Mechanics",
        content: "Enhance with defensive options:",
        code: "Add a blocking mechanic where holding right-click reduces damage by 50%"
      },
      {
        title: "Create Health System",
        content: "Generate a module script:",
        code: "Create a health system module that handles player health, regeneration, and respawning"
      },
      {
        title: "Polish the Experience",
        content: "Add feedback:",
        code: "Add sound effects for sword swings, hits, and blocks"
      }
    ]
  }
];

const commonFeatures = [
  {
    title: "Leaderboards",
    prompt: "Create a leaderboard showing kills, deaths, and points that updates in real-time",
    icon: "🏆"
  },
  {
    title: "Daily Rewards",
    prompt: "Create a daily reward system that gives increasing rewards for consecutive days, resetting if a day is missed",
    icon: "🎁"
  },
  {
    title: "Pet System",
    prompt: "Create a pet system where pets follow the player, can be equipped/unequipped, and provide stat bonuses",
    icon: "🐾"
  },
  {
    title: "Trading System",
    prompt: "Create a secure trading system where players can trade items with trade confirmation",
    icon: "🤝"
  },
  {
    title: "Admin Commands",
    prompt: "Create admin commands for kick, ban, teleport, and give items with permission levels",
    icon: "👮"
  },
  {
    title: "Save System",
    prompt: "Create a data persistence system that saves player stats, inventory, and settings",
    icon: "💾"
  }
];

const tips = [
  {
    title: "Generate Incrementally",
    content: "Instead of asking for a complete game, build it piece by piece. Generate one system, test it, then add the next."
  },
  {
    title: "Be Specific",
    content: "The more details you provide, the better the code. Include numbers, colors, timing, and specific behaviors."
  },
  {
    title: "Use Script Types Correctly",
    content: "Server scripts for game logic and security, Client scripts for UI and input, Module scripts for shared code."
  },
  {
    title: "Test Often",
    content: "Generate code → Test in Studio → Fix issues → Add features. This cycle helps catch problems early."
  },
  {
    title: "Learn from Generated Code",
    content: "Read the comments, understand the structure, and ask the chat to explain complex parts."
  }
];

export default function HowToUsePage() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const tutorial = tutorials.find(t => t.id === selectedTutorial);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">How to Use Roblox Code Generator</h1>
            <p className="text-xl text-gray-400">Step-by-step tutorials, common features, and pro tips</p>
          </div>

        {!selectedTutorial ? (
          <>
            {/* Tutorials Grid */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Step-by-Step Tutorials</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {tutorials.map(tutorial => (
                  <div
                    key={tutorial.id}
                    onClick={() => setSelectedTutorial(tutorial.id)}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">{tutorial.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tutorial.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        tutorial.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tutorial.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{tutorial.description}</p>
                    <div className="flex items-center text-blue-400">
                      <span className="text-sm">Start Tutorial</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Common Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Common Game Features</h2>
              <p className="text-gray-400 mb-6">Click any prompt to copy it and use in the generator</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonFeatures.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => copyPrompt(feature.prompt)}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.prompt}</p>
                        <div className="mt-2 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedPrompt === feature.prompt ? '✓ Copied!' : 'Click to copy'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Pro Tips</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-6">
                    <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
                    <p className="text-gray-400">{tip.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : tutorial ? (
          /* Tutorial Detail View */
          <div>
            <button
              onClick={() => setSelectedTutorial(null)}
              className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tutorials
            </button>

            <div className="bg-gray-800 rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{tutorial.title}</h2>
                  <p className="text-gray-400">{tutorial.description}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded ${
                  tutorial.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  tutorial.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {tutorial.difficulty}
                </span>
              </div>

              <div className="space-y-8">
                {tutorial.steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-300 mb-4">{step.content}</p>
                        
                        {step.code && (
                          <div
                            onClick={() => copyPrompt(step.code!)}
                            className="bg-gray-900 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-700 transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <code className="text-sm text-blue-400">{step.code}</code>
                              <span className="text-xs text-gray-500 group-hover:text-blue-400 ml-4">
                                {copiedPrompt === step.code ? '✓ Copied!' : 'Click to copy'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {step.tip && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-300">
                              <span className="font-semibold">💡 Tip:</span> {step.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < tutorial.steps.length - 1 && (
                      <div className="ml-4 w-px h-8 bg-gray-700 my-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            Have questions?{' '}
            <Link href="/faq" className="text-blue-400 hover:underline">
              Check out our FAQ
            </Link>
            {' '}or use the chat assistant in the generator.
          </p>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}