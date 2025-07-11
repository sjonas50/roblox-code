"use client";

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [message, setMessage] = useState('Initial state');
  const [debugInfo, setDebugInfo] = useState<string[]>(['Page loaded']);
  
  useEffect(() => {
    console.log('SimpleTestPage mounted - useEffect running');
    addDebug('useEffect triggered');
    checkAuth();
  }, []);
  
  const addDebug = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${msg}`);
    setDebugInfo(prev => [...prev, `[${timestamp}] ${msg}`]);
  };
  
  const checkAuth = async () => {
    addDebug('checkAuth function called');
    setMessage('Checking authentication...');
    
    try {
      addDebug('Attempting to import Supabase client...');
      const { createClient } = await import('@/lib/supabase/client');
      addDebug('Supabase client imported successfully');
      
      const supabase = createClient();
      addDebug('Supabase client created');
      
      const { data: { user }, error } = await supabase.auth.getUser();
      addDebug(`Auth check complete - User: ${user ? 'Found' : 'Not found'}, Error: ${error ? error.message : 'None'}`);
      
      if (error) {
        setMessage(`Auth error: ${error.message}`);
      } else if (user) {
        setMessage(`Logged in as: ${user.email} (ID: ${user.id})`);
      } else {
        setMessage('Not logged in');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Auth check error:', error);
      addDebug(`Error caught: ${errorMsg}`);
      setMessage(`Error: ${errorMsg}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <p className="text-lg font-semibold">{message}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Log:</h2>
        <div className="bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
          {debugInfo.map((info, idx) => (
            <p key={idx} className="text-sm text-gray-300 font-mono">{info}</p>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => {
          addDebug('Manual check triggered');
          checkAuth();
        }}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
      >
        Check Auth Again
      </button>
      
      <div className="mt-8 text-sm text-gray-400">
        <p>This page shows a detailed debug log of what's happening.</p>
        <p>Check the browser console (F12) for additional details.</p>
      </div>
    </div>
  );
}