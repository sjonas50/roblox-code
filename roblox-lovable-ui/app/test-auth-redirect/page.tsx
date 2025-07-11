"use client";

import { useState } from 'react';
import { signIn } from '@/lib/auth/utils';
import { useRouter } from 'next/navigation';

export default function TestAuthRedirectPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const testSignInAndRedirect = async () => {
    if (!email || !password) {
      addLog('Please enter email and password');
      return;
    }

    addLog(`Attempting sign in with ${email}...`);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        addLog(`Sign in error: ${error.message}`);
      } else if (data?.user) {
        addLog(`Sign in successful! User ID: ${data.user.id}`);
        addLog('Now attempting redirect...');
        
        // Test immediate redirect
        addLog('Method 1: Immediate window.location.href');
        window.location.href = '/generator';
        
        // This shouldn't execute if redirect works
        addLog('PROBLEM: Code after redirect is still executing!');
      } else {
        addLog('No user data returned');
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const testSignInWithReplace = async () => {
    if (!email || !password) {
      addLog('Please enter email and password');
      return;
    }

    addLog(`Attempting sign in with ${email}...`);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        addLog(`Sign in error: ${error.message}`);
      } else if (data?.user) {
        addLog(`Sign in successful! User ID: ${data.user.id}`);
        addLog('Using window.location.replace()...');
        window.location.replace('/generator');
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Auth Redirect</h1>
      
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <p className="text-blue-300">Test sign in with immediate redirect.</p>
        <p className="text-sm text-gray-300 mt-2">Enter your credentials and watch the console.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 bg-gray-800 rounded w-full max-w-xs"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 bg-gray-800 rounded w-full max-w-xs"
            placeholder="••••••••"
          />
        </div>
        
        <div className="space-x-2">
          <button
            onClick={testSignInAndRedirect}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
          >
            Test Sign In + location.href
          </button>
          
          <button
            onClick={testSignInWithReplace}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded"
          >
            Test Sign In + location.replace
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Log:</h2>
        <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
          {logs.map((log, idx) => (
            <p key={idx} className={
              log.includes('error') || log.includes('PROBLEM') ? 'text-red-400' : 
              log.includes('successful') ? 'text-green-400' : 
              'text-gray-300'
            }>
              {log}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>Check browser console (F12) for additional logs.</p>
        <p>If redirect works, you'll be taken to /generator.</p>
      </div>
    </div>
  );
}