"use client";

import { useState } from 'react';
import { createDirectClient } from '@/lib/supabase/direct-client';

export default function TestDirectClientPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword');

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const testDirectClient = async () => {
    setLogs([]);
    const client = createDirectClient();

    // Test 1: Get current user
    addLog('Test 1: Getting current user...');
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      addLog(`User error: ${userError.message}`);
    } else {
      addLog(`Current user: ${userData.user ? userData.user.email : 'Not logged in'}`);
    }

    // Test 2: Query profiles
    addLog('Test 2: Querying profiles table...');
    const { data: profiles, error: profileError } = await client.from('profiles').select('id,email');
    if (profileError) {
      addLog(`Profile error: ${JSON.stringify(profileError)}`);
    } else {
      addLog(`Found ${profiles?.length || 0} profiles`);
    }

    addLog('Test complete!');
  };

  const testSignIn = async () => {
    setLogs([]);
    const client = createDirectClient();

    addLog(`Attempting sign in with: ${email}`);
    const { data, error } = await client.auth.signIn(email, password);
    
    if (error) {
      addLog(`Sign in error: ${error.message}`);
    } else {
      addLog(`Sign in success! User: ${data.user?.email}`);
      
      // Test authenticated query
      addLog('Testing authenticated query...');
      const { data: profiles, error: profileError } = await client.from('profiles').select('*');
      if (profileError) {
        addLog(`Query error: ${JSON.stringify(profileError)}`);
      } else {
        addLog(`Query success! Found ${profiles?.length || 0} profiles`);
      }
    }
  };

  const testSignOut = async () => {
    const client = createDirectClient();
    await client.auth.signOut();
    addLog('Signed out!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Client Test (React 19 Workaround)</h1>
      
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <p className="text-blue-300 mb-2">This uses direct REST API calls instead of the Supabase SDK.</p>
        <p className="text-sm text-gray-300">Should work even with React 19!</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testDirectClient}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded mr-2"
        >
          Test Direct Client
        </button>

        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 bg-gray-800 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 bg-gray-800 rounded"
            />
          </div>
          <button
            onClick={testSignIn}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
          >
            Test Sign In
          </button>
          <button
            onClick={testSignOut}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Log:</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, idx) => (
            <p key={idx} className={
              log.includes('error') ? 'text-red-400' : 
              log.includes('success') ? 'text-green-400' : 
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