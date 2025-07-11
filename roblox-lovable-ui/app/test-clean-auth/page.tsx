"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestCleanAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async () => {
    setMessage('Signing in...');
    
    const supabase = createClient();
    
    // Method 1: Simple sign in with immediate page reload
    supabase.auth.signInWithPassword({
      email,
      password,
    }).then(({ error }) => {
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Success! Reloading page...');
        // Force page reload to ensure auth state is picked up
        setTimeout(() => {
          window.location.href = '/generator';
        }, 500);
      }
    });
  };

  const handleSignInAlt = async () => {
    setMessage('Signing in (alternative method)...');
    
    const supabase = createClient();
    
    // Method 2: Use auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session) {
        setMessage('Signed in! Redirecting...');
        authListener.subscription.unsubscribe();
        window.location.href = '/generator';
      }
    });
    
    // Trigger sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setMessage(`Error: ${error.message}`);
      authListener.subscription.unsubscribe();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Clean Auth Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded"
            placeholder="••••••••"
          />
        </div>
        
        <button
          onClick={handleSignIn}
          disabled={!email || !password}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded"
        >
          Sign In (Method 1: Promise + Reload)
        </button>
        
        <button
          onClick={handleSignInAlt}
          disabled={!email || !password}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded"
        >
          Sign In (Method 2: Auth Listener)
        </button>
        
        {message && (
          <div className={`p-4 rounded ${
            message.includes('Error') ? 'bg-red-900/20 text-red-400' : 
            message.includes('Success') || message.includes('Signed in') ? 'bg-green-900/20 text-green-400' : 
            'bg-gray-800 text-gray-300'
          }`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        <p>This test uses the simplest possible auth implementation.</p>
        <p>Check console for auth events.</p>
      </div>
    </div>
  );
}