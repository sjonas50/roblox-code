"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  onCodeUpdate: (newCode: string, description?: string) => void;
  scriptType: 'server' | 'client' | 'module';
  originalPrompt: string;
}

export default function ChatPanel({ 
  isOpen, 
  onClose, 
  currentCode, 
  onCodeUpdate,
  scriptType,
  originalPrompt
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add initial message when panel opens
      const hasCode = currentCode && currentCode.trim().length > 0;
      const initialMessage = hasCode 
        ? `I'm your Roblox development assistant! I can help you with:\n\n📖 **Questions & Guidance**\n• How to implement this code in Roblox Studio\n• Where to place scripts (ServerScriptService, StarterGui, etc.)\n• How to test and debug your scripts\n• Best practices and tips\n\n🔧 **Code Modifications**\n• Add new features (just describe what you want)\n• Fix errors (paste error messages from Studio)\n• Optimize or improve the code\n• Explain how the code works\n\nWhat would you like help with?`
        : `I'm your Roblox development assistant! I can help you:\n\n🎮 **Generate Code**\n• Create scripts for game mechanics\n• Build UI systems and GUIs\n• Implement player controls\n• Add special effects and animations\n\n📚 **Answer Questions**\n• How to use Roblox Studio\n• Where to place different script types\n• Best practices for Roblox development\n• Troubleshooting common issues\n\nWhat would you like to create or learn about?`;
        
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, scriptType, currentCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          currentCode,
          scriptType,
          originalPrompt,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage = "";
      let updatedCode = "";
      let codeDescription = "";
      let hasCodeUpdate = false;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'message':
                  assistantMessage += data.content;
                  // Update the last assistant message or create new one
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant' && !updatedCode) {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: assistantMessage }
                      ];
                    } else if (!prev.find(m => m.id === 'assistant-' + userMessage.id)) {
                      return [...prev, {
                        id: 'assistant-' + userMessage.id,
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date()
                      }];
                    }
                    return prev;
                  });
                  break;
                  
                case 'code':
                  updatedCode = data.code;
                  console.log('📦 Chat received code update:');
                  console.log('  - Code length:', data.code?.length || 0, 'characters');
                  console.log('  - First 100 chars:', data.code?.substring(0, 100));
                  
                  if (data.code && data.code.trim()) {
                    hasCodeUpdate = true;
                    // Extract a description from the user's message
                    codeDescription = userMessage.content.length > 50 
                      ? userMessage.content.substring(0, 50) + '...'
                      : userMessage.content;
                    
                    console.log('  🚀 Calling onCodeUpdate with description:', `Chat fix: ${codeDescription}`);
                    onCodeUpdate(data.code, `Chat fix: ${codeDescription}`);
                  } else {
                    console.log('  ⚠️ Code is empty or whitespace only');
                  }
                  break;
                  
                case 'error':
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `Error: ${data.error}`,
                    timestamp: new Date()
                  }]);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
      
      // Only add code update success message if code was actually updated
      if (hasCodeUpdate) {
        const successMsg = {
          id: Date.now().toString() + '-success',
          role: 'assistant' as const,
          content: '✅ Code updated! The changes are now displayed in Version ' + (messages.filter(m => m.role === 'assistant').length + 1) + '.',
          timestamp: new Date()
        };
        console.log('  💬 Adding code update success message');
        setMessages(prev => [...prev, successMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Chat Panel */}
      <div className={`fixed right-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } w-full md:w-96`}>
        <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Assistant</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the code or paste an error..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}