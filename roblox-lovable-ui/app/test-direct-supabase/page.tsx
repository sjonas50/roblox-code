"use client";

import { useState } from 'react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default function TestDirectSupabasePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const logEntry = `${new Date().toLocaleTimeString()} - ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const runTest = async () => {
    setTesting(true);
    setLogs([]);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Create client using direct supabase-js instead of SSR
      addLog('Creating direct Supabase client (no SSR)...');
      const supabase = createSupabaseClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            getItem: (key: string) => {
              addLog(`Storage.getItem called for: ${key}`);
              return localStorage.getItem(key);
            },
            setItem: (key: string, value: string) => {
              addLog(`Storage.setItem called for: ${key}`);
              localStorage.setItem(key, value);
            },
            removeItem: (key: string) => {
              addLog(`Storage.removeItem called for: ${key}`);
              localStorage.removeItem(key);
            }
          }
        }
      });
      addLog('Direct client created');

      // Test getSession
      addLog('Testing getSession...');
      const startTime = Date.now();
      try {
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout after 3s')), 3000)
          )
        ]);
        const elapsed = Date.now() - startTime;
        if (error) {
          addLog(`getSession error after ${elapsed}ms: ${error.message}`);
        } else {
          addLog(`getSession success after ${elapsed}ms: ${data.session ? 'Has session' : 'No session'}`);
        }
      } catch (e) {
        const elapsed = Date.now() - startTime;
        addLog(`getSession exception after ${elapsed}ms: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

      // Test direct table query
      addLog('Testing direct table query (profiles)...');
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          addLog(`Table query error: ${error.message} (status: ${status})`);
        } else {
          addLog(`Table query success: ${data ? data.length : 0} rows`);
        }
      } catch (e) {
        addLog(`Table query exception: ${e instanceof Error ? e.message : 'Unknown'}`);
      }

    } catch (error) {
      addLog(`Test error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Supabase Test (No SSR)</h1>
      
      <button
        onClick={runTest}
        disabled={testing}
        className="mb-6 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded"
      >
        {testing ? 'Testing...' : 'Run Direct Test'}
      </button>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Log:</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">Click "Run Direct Test" to start</p>
          ) : (
            logs.map((log, idx) => (
              <p key={idx} className={
                log.includes('error') || log.includes('exception') || log.includes('Timeout') ? 'text-red-400' : 
                log.includes('success') ? 'text-green-400' : 
                'text-gray-300'
              }>
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
        <p className="text-sm text-gray-300">
          This test uses the Supabase client directly without the SSR wrapper to isolate any SSR-specific issues.
        </p>
      </div>
    </div>
  );
}