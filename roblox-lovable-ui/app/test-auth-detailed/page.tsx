"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function TestAuthDetailedPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const runTests = async () => {
    setTesting(true);
    setLogs([]);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Test 1: Create client without any custom options
      addLog('Creating basic Supabase client...');
      const basicClient = createBrowserClient(url, key);
      addLog('Basic client created');

      // Test 2: Try different auth methods
      addLog('Testing auth.getSession() with 3s timeout...');
      try {
        const sessionResult = await Promise.race([
          basicClient.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        addLog('getSession completed successfully');
      } catch (e) {
        addLog(`getSession error: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test 3: Try getUser
      addLog('Testing auth.getUser() with 3s timeout...');
      try {
        const userResult = await Promise.race([
          basicClient.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        addLog('getUser completed successfully');
      } catch (e) {
        addLog(`getUser error: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test 4: Check localStorage
      addLog('Checking localStorage for Supabase keys...');
      const localStorageKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      addLog(`Found ${localStorageKeys.length} Supabase keys: ${localStorageKeys.join(', ') || 'none'}`);

      // Test 5: Check cookies
      addLog('Checking cookies...');
      const cookies = document.cookie.split('; ').filter(c => 
        c.includes('supabase') || c.includes('sb-')
      );
      addLog(`Found ${cookies.length} Supabase cookies`);

      // Test 6: Direct REST API call
      addLog('Testing direct REST API call to auth endpoint...');
      try {
        const response = await fetch(`${url}/auth/v1/user`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        addLog(`Direct auth API status: ${response.status}`);
        const data = await response.json();
        addLog(`Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (e) {
        addLog(`Direct API error: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test 7: Check if it's a Next.js SSR issue
      addLog('Checking window object...');
      addLog(`Window available: ${typeof window !== 'undefined'}`);
      addLog(`Document available: ${typeof document !== 'undefined'}`);

    } catch (error) {
      addLog(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Detailed Auth Test</h1>
      
      <button
        onClick={runTests}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 rounded"
      >
        {testing ? 'Testing...' : 'Run Detailed Tests'}
      </button>

      <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <div className="space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400">Click "Run Detailed Tests" to start</p>
          ) : (
            logs.map((log, idx) => (
              <p key={idx} className={
                log.includes('error') || log.includes('Timeout') ? 'text-red-400' : 
                log.includes('successfully') ? 'text-green-400' : 
                'text-gray-300'
              }>
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <p className="text-sm text-gray-300">
          This test checks various auth methods and storage mechanisms to identify where the issue is.
        </p>
      </div>
    </div>
  );
}