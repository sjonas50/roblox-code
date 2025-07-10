"use client";

import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import GradientBackground from "@/components/GradientBackground";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Generation",
      description: "Describe what you want in plain English, and get professional Roblox code instantly"
    },
    {
      icon: "📚",
      title: "Template Library",
      description: "Start with pre-built systems for shops, teams, combat, and more"
    },
    {
      icon: "💬",
      title: "Smart Chat Assistant",
      description: "Fix errors, add features, and get explanations without leaving the app"
    },
    {
      icon: "📁",
      title: "Project Management",
      description: "Organize multiple scripts and games with our built-in project system"
    },
    {
      icon: "🎓",
      title: "Learn As You Build",
      description: "Interactive tutorials and examples help you understand the generated code"
    },
    {
      icon: "📤",
      title: "Easy Export",
      description: "Export to Roblox Studio, Rojo, or save backups with one click"
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <GradientBackground />
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Build Roblox Games
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                  with AI
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Generate professional Roblox scripts using natural language. 
                No coding experience required - just describe what you want to build.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? "/generator" : "/auth/signup"}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  {user ? "Open Generator" : "Start Creating"}
                </Link>
                <Link
                  href="/how-to-use"
                  className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  View Tutorials
                </Link>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Everything You Need to Build Amazing Games
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-all"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Describe Your Idea
                </h3>
                <p className="text-gray-400">
                  Tell the AI what you want to create in plain English
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Generate & Customize
                </h3>
                <p className="text-gray-400">
                  Get instant code and refine it with our smart chat
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Export to Roblox
                </h3>
                <p className="text-gray-400">
                  Copy your code or export directly to Roblox Studio
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl p-12 text-center backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Build Your Dream Game?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of creators using AI to build Roblox games faster than ever.
              </p>
              <Link
                href={user ? "/generator" : "/auth/signup"}
                className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
              >
                {user ? "Go to Generator" : "Start Building Now"}
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-800 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2024 Roblox Code Generator. Built with Claude AI.
                </p>
                <div className="flex gap-6 mt-4 sm:mt-0">
                  <Link href="/faq" className="text-gray-400 hover:text-white text-sm">
                    FAQ
                  </Link>
                  <Link href="/how-to-use" className="text-gray-400 hover:text-white text-sm">
                    How to Use
                  </Link>
                  <a
                    href="https://github.com/sjonas50/roblox-code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </PublicLayout>
  );
}