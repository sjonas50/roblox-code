"use client";

import { useState } from 'react';

export default function TestMinimalPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const runTest = async () => {
    setTesting(true);
    setLogs([]);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Test 1: Simple fetch without any SDK
      addLog('Test 1: Direct fetch to /rest/v1/profiles');
      try {
        const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        addLog(`Profiles API: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const data = await response.json();
          addLog(`Result: ${JSON.stringify(data)}`);
        }
      } catch (e) {
        addLog(`Fetch error: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test 2: Create minimal Supabase client
      addLog('Test 2: Creating minimal Supabase client...');
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabase = createClient(url, key, {
        auth: {
          persistSession: false,  // Disable session persistence
          autoRefreshToken: false, // Disable auto refresh
          detectSessionInUrl: false // Disable URL detection
        }
      });
      addLog('Minimal client created');

      // Test 3: Simple table query
      addLog('Test 3: Simple from() query...');
      const startQuery = Date.now();
      try {
        const { data, error, status } = await Promise.race([
          supabase.from('profiles').select('id').limit(1),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 3000)
          )
        ]);
        const elapsed = Date.now() - startQuery;
        addLog(`Query completed in ${elapsed}ms - Status: ${status}`);
        if (error) {
          addLog(`Query error: ${error.message}`);
        } else {
          addLog(`Query result: ${JSON.stringify(data)}`);
        }
      } catch (e) {
        const elapsed = Date.now() - startQuery;
        addLog(`Query failed after ${elapsed}ms: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test 4: Check versions
      addLog('Test 4: Checking package versions...');
      addLog(`Supabase URL: ${url.includes('supabase.co') ? 'Hosted' : 'Self-hosted'}`);
      
    } catch (error) {
      addLog(`Test error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Supabase Test</h1>
      
      <button
        onClick={runTest}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 rounded"
      >
        {testing ? 'Testing...' : 'Run Minimal Test'}
      </button>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Log:</h2>
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, idx) => (
            <p key={idx} className={
              log.includes('error') || log.includes('timeout') || log.includes('failed') ? 'text-red-400' : 
              log.includes('200') || log.includes('completed') ? 'text-green-400' : 
              'text-gray-300'
            }>
              {log}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-orange-900/20 border border-orange-600/50 rounded-lg">
        <p className="text-sm text-gray-300">
          This test uses the absolute minimum Supabase configuration to isolate the issue.
        </p>
      </div>
    </div>
  );
}