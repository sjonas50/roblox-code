"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TestLogoutPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const { user, signOut: contextSignOut } = useAuth();

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const testCurrentAuth = async () => {
    addLog('=== Testing Current Auth State ===');
    
    // Check context
    addLog(`Context user: ${user ? `${user.email} (${user.id})` : 'null'}`);
    
    // Check Supabase directly
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    addLog(`Supabase session: ${session ? `${session.user.email}` : 'null'}`);
    
    // Check localStorage
    const keys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'));
    addLog(`LocalStorage keys: ${keys.join(', ') || 'none'}`);
  };

  const testDirectSignOut = async () => {
    addLog('=== Testing Direct Supabase Sign Out ===');
    
    const supabase = createClient();
    addLog('Calling supabase.auth.signOut()...');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      addLog(`Sign out error: ${error.message}`);
    } else {
      addLog('Sign out successful');
    }
    
    // Check session after
    const { data: { session } } = await supabase.auth.getSession();
    addLog(`Session after signOut: ${session ? 'Still exists!' : 'null (good)'}`);
  };

  const testContextSignOut = async () => {
    addLog('=== Testing Context Sign Out ===');
    
    try {
      await contextSignOut();
      addLog('Context signOut completed');
      
      // Check if user is cleared
      setTimeout(() => {
        addLog(`Context user after 1s: ${user ? 'Still exists!' : 'null (good)'}`);
      }, 1000);
    } catch (error) {
      addLog(`Context signOut error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const manualClearAndRedirect = () => {
    addLog('=== Manual Clear and Redirect ===');
    
    // Clear all auth data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
        addLog(`Removed: ${key}`);
      }
    });
    
    sessionStorage.clear();
    addLog('Cleared sessionStorage');
    
    // Redirect
    addLog('Redirecting to home...');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Logout Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <p className="text-lg">Current user: {user ? user.email : 'Not logged in'}</p>
      </div>

      <div className="space-x-2 mb-6">
        <button
          onClick={testCurrentAuth}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Check Auth State
        </button>
        
        <button
          onClick={testDirectSignOut}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
        >
          Test Direct SignOut
        </button>
        
        <button
          onClick={testContextSignOut}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded"
        >
          Test Context SignOut
        </button>
        
        <button
          onClick={manualClearAndRedirect}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
        >
          Manual Clear & Redirect
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Log:</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, idx) => (
            <p key={idx} className={
              log.includes('===') ? 'text-yellow-400 font-bold' :
              log.includes('error') || log.includes('Still exists!') ? 'text-red-400' : 
              log.includes('successful') || log.includes('null (good)') ? 'text-green-400' : 
              'text-gray-300'
            }>
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}