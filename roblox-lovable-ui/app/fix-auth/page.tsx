"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function FixAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [fixed, setFixed] = useState(false);

  const addLog = (message: string) => {
    const logEntry = `${new Date().toLocaleTimeString()} - ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const fixAuth = async () => {
    setLogs([]);
    setFixed(false);

    try {
      // Step 1: Clear everything
      addLog('Step 1: Clearing all auth data...');
      
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        addLog(`Removed localStorage: ${key}`);
      });
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
          addLog(`Cleared cookie: ${name}`);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();
      addLog('Cleared sessionStorage');

      // Step 2: Create fresh client
      addLog('Step 2: Creating fresh Supabase client...');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      addLog('Fresh client created');

      // Step 3: Test the fresh client
      addLog('Step 3: Testing fresh client...');
      try {
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        
        if (error) {
          addLog(`Test error: ${error.message}`);
        } else {
          addLog(`Test success: ${data.session ? 'Has session' : 'No session (expected)'}`);
          setFixed(true);
        }
      } catch (e) {
        addLog(`Test timeout - auth might still be broken`);
      }

      addLog('Fix attempt complete!');
      
    } catch (error) {
      addLog(`Error during fix: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Fix Auth State</h1>
      
      <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
        <p className="text-yellow-300 mb-2">This will clear all auth data and reinitialize Supabase.</p>
        <p className="text-sm text-gray-300">After running this, you'll need to sign in again.</p>
      </div>

      <button
        onClick={fixAuth}
        className="mb-6 px-6 py-3 bg-red-500 hover:bg-red-600 rounded font-semibold"
      >
        Clear & Fix Auth
      </button>

      {fixed && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
          <p className="text-green-400">✓ Auth state cleared successfully!</p>
          <p className="text-sm text-gray-300 mt-2">
            You can now <a href="/auth/login" className="text-blue-400 hover:underline">sign in again</a>
          </p>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Fix Log:</h2>
        <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">Click "Clear & Fix Auth" to start</p>
          ) : (
            logs.map((log, idx) => (
              <p key={idx} className="text-gray-300">{log}</p>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>After fixing, test auth at: <a href="/test-simple" className="text-blue-400 hover:underline">/test-simple</a></p>
      </div>
    </div>
  );
}