"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirectsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const testRouterPush = () => {
    addLog('Testing router.push("/")...');
    router.push('/');
  };

  const testRouterReplace = () => {
    addLog('Testing router.replace("/")...');
    router.replace('/');
  };

  const testWindowLocation = () => {
    addLog('Testing window.location.href = "/"...');
    window.location.href = '/';
  };

  const testWindowReplace = () => {
    addLog('Testing window.location.replace("/")...');
    window.location.replace('/');
  };

  const testDelayedRedirect = () => {
    addLog('Testing delayed redirect in 2 seconds...');
    setTimeout(() => {
      addLog('Redirecting now...');
      window.location.replace('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Redirects Page</h1>
      
      <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
        <p className="text-yellow-300">Click a button to test different redirect methods.</p>
        <p className="text-sm text-gray-300 mt-2">If redirect works, you'll be taken to the home page.</p>
      </div>

      <div className="space-y-2 mb-6">
        <button
          onClick={testRouterPush}
          className="block px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Test router.push()
        </button>
        
        <button
          onClick={testRouterReplace}
          className="block px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded"
        >
          Test router.replace()
        </button>
        
        <button
          onClick={testWindowLocation}
          className="block px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
        >
          Test window.location.href
        </button>
        
        <button
          onClick={testWindowReplace}
          className="block px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded"
        >
          Test window.location.replace()
        </button>
        
        <button
          onClick={testDelayedRedirect}
          className="block px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
        >
          Test Delayed Redirect (2s)
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Log:</h2>
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log, idx) => (
            <p key={idx} className="text-gray-300">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}