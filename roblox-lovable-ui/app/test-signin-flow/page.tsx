"use client";

import { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth/utils';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function TestSignInFlowPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    addLog(`Page loaded. Context user: ${user ? user.email : 'null'}`);
  }, [user]);

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const testSignInFlow = async () => {
    if (!email || !password) {
      addLog('Please enter credentials');
      return;
    }

    addLog('=== Starting Sign In Test ===');
    addLog(`Email: ${email}`);
    
    // Step 1: Sign in
    addLog('Step 1: Calling signIn()...');
    const { data, error } = await signIn(email, password);
    
    if (error) {
      addLog(`Sign in error: ${error.message}`);
      return;
    }
    
    if (!data?.user) {
      addLog('No user data returned');
      return;
    }
    
    addLog(`Sign in successful! User ID: ${data.user.id}`);
    
    // Step 2: Check if we can get session immediately
    addLog('Step 2: Checking session immediately...');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    addLog(`Session check: ${session ? 'Found' : 'Not found'}`);
    
    // Step 3: Check auth context
    addLog('Step 3: Checking auth context...');
    addLog(`Context user: ${user ? user.email : 'null'}`);
    
    // Step 4: Try redirect
    addLog('Step 4: Attempting redirect in 1 second...');
    setTimeout(() => {
      addLog('Redirecting NOW to /generator...');
      window.location.href = '/generator';
    }, 1000);
  };

  const immediateRedirect = () => {
    addLog('Immediate redirect to /generator...');
    window.location.href = '/generator';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Sign In Flow</h1>
      
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <p className="text-blue-300">Debug the sign in and redirect flow step by step.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 bg-gray-800 rounded w-full"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 bg-gray-800 rounded w-full"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={testSignInFlow}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
            >
              Test Sign In Flow
            </button>
            
            <button
              onClick={immediateRedirect}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded"
            >
              Test Direct Redirect (No Auth)
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Log:</h2>
          <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <p key={idx} className={
                log.includes('===') ? 'text-yellow-400 font-bold' :
                log.includes('error') ? 'text-red-400' : 
                log.includes('successful') ? 'text-green-400' : 
                'text-gray-300'
              }>
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}