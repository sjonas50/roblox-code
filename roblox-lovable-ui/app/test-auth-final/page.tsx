"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthFinalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      addLog(`User detected: ${user.email} - Redirecting...`);
      router.push('/generator');
    }
  }, [user, router]);

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const handleDirectSignIn = async () => {
    setLoading(true);
    addLog('Starting direct sign in...');
    
    const supabase = createClient();
    
    // Don't await - just trigger the sign in
    addLog('Triggering signInWithPassword (not awaiting)...');
    supabase.auth.signInWithPassword({
      email,
      password,
    }).then(({ data, error }) => {
      addLog('Promise resolved!');
      if (error) {
        addLog(`Error: ${error.message}`);
        setLoading(false);
      } else if (data?.user) {
        addLog(`Success: ${data.user.email}`);
      }
    }).catch(err => {
      addLog(`Promise rejected: ${err}`);
      setLoading(false);
    });
    
    // Immediately refresh router
    addLog('Refreshing router...');
    router.refresh();
    
    // Check session after a delay
    setTimeout(async () => {
      addLog('Checking session after 2 seconds...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        addLog(`Session found: ${session.user.email}`);
        if (!user) {
          addLog('User not in context yet, forcing page reload...');
          window.location.href = '/generator';
        }
      } else {
        addLog('No session found');
        setLoading(false);
      }
    }, 2000);
  };

  const handleSignInWithForceReload = async () => {
    setLoading(true);
    addLog('Sign in with force reload approach...');
    
    const supabase = createClient();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth event: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        addLog('SIGNED_IN event received, reloading page...');
        authListener.subscription.unsubscribe();
        window.location.href = '/generator';
      }
    });
    
    // Trigger sign in
    addLog('Triggering sign in...');
    supabase.auth.signInWithPassword({
      email,
      password,
    }).catch(err => {
      addLog(`Sign in error: ${err}`);
      setLoading(false);
      authListener.subscription.unsubscribe();
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Final Auth Test</h1>
      
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
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 bg-gray-800 rounded w-full"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={handleDirectSignIn}
              disabled={loading || !email || !password}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded"
            >
              Direct Sign In (Router Refresh)
            </button>
            
            <button
              onClick={handleSignInWithForceReload}
              disabled={loading || !email || !password}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded"
            >
              Sign In with Force Reload
            </button>
          </div>
          
          {user && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
              <p className="text-green-400">Logged in as: {user.email}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Log:</h2>
          <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <p key={idx} className={
                log.includes('Error') || log.includes('rejected') ? 'text-red-400' : 
                log.includes('Success') || log.includes('found') ? 'text-green-400' : 
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