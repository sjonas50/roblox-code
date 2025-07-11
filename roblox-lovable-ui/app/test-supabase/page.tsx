"use client";

import { useState } from 'react';

export default function TestSupabasePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const testSupabase = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      // Test 1: Environment variables
      addLog('Testing environment variables...');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      addLog(`URL: ${url ? 'Set' : 'Missing'}`);
      addLog(`Key: ${key ? `Set (${key.substring(0, 20)}...)` : 'Missing'}`);

      if (!url || !key) {
        addLog('ERROR: Missing environment variables!');
        setTesting(false);
        return;
      }

      // Test 2: Import client
      addLog('Importing Supabase client...');
      const { createClient } = await import('@/lib/supabase/client');
      addLog('Import successful');

      // Test 3: Create client instance
      addLog('Creating client instance...');
      const supabase = createClient();
      addLog('Client created');

      // Test 4: Test basic connection with timeout
      addLog('Testing connection with getSession()...');
      const sessionPromise = supabase.auth.getSession();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000)
      );

      try {
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          addLog(`Session error: ${sessionError.message}`);
        } else {
          addLog(`Session: ${sessionData?.session ? 'Active' : 'No session'}`);
        }
      } catch (timeoutError) {
        addLog('ERROR: Request timed out after 5 seconds');
        addLog('Possible issues: Network blocked, CORS, or Supabase project paused');
      }

      // Test 5: Direct fetch test
      addLog('Testing direct fetch to Supabase...');
      try {
        const response = await fetch(`${url}/auth/v1/health`, {
          method: 'GET',
          headers: {
            'apikey': key,
          }
        });
        addLog(`Direct fetch status: ${response.status}`);
        if (!response.ok) {
          const text = await response.text();
          addLog(`Response: ${text}`);
        }
      } catch (fetchError) {
        addLog(`Fetch error: ${fetchError instanceof Error ? fetchError.message : 'Unknown'}`);
      }

    } catch (error) {
      addLog(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`);
      console.error('Test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <button
        onClick={testSupabase}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded"
      >
        {testing ? 'Testing...' : 'Run Test'}
      </button>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Log:</h2>
        <div className="space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400">Click "Run Test" to start</p>
          ) : (
            logs.map((log, idx) => (
              <p key={idx} className={log.includes('ERROR') ? 'text-red-400' : 'text-gray-300'}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
        <h3 className="text-yellow-400 font-semibold mb-2">Common Issues:</h3>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Supabase project might be paused (check dashboard)</li>
          <li>Network/firewall blocking requests</li>
          <li>Browser extensions blocking requests</li>
          <li>Invalid API keys</li>
        </ul>
      </div>
    </div>
  );
}