"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { forceLogout as serverForceLogout } from '@/app/actions/auth';

export default function ForceLogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Logging out...');

  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Get Supabase client
        const supabase = createClient();
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Clear specific Supabase cookies - SSR uses a different pattern
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectRef = supabaseUrl.includes('supabase.co') 
          ? supabaseUrl.split('.')[0].replace('https://', '') 
          : 'localhost';
        
        const cookiesToClear = [
          'sb-access-token',
          'sb-refresh-token',
          'sb-auth-token',
          'supabase-auth-token',
          `sb-${projectRef}-auth-token`,
          `sb-${projectRef}-auth-token-code-verifier`,
          'sb-api-auth-token'
        ];
        
        // Clear cookies with all possible domain variations
        cookiesToClear.forEach(cookieName => {
          // Clear for root path
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          // Clear for current domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
          // Clear for parent domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
          // Clear for localhost
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost`;
          // Clear for .localhost
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost`;
        });
        
        setStatus('Logout complete! Redirecting...');
        
        // Try server-side logout as well
        try {
          await serverForceLogout();
        } catch (e) {
          // Server action might fail due to redirect, that's okay
          console.log('Server logout attempted');
        }
        
        // Force reload to clear any in-memory state
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        
      } catch (error) {
        console.error('Force logout error:', error);
        setStatus('Error during logout, but clearing data anyway...');
        
        // Even if there's an error, still clear everything and redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    forceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Force Logout</h1>
        <p className="text-gray-400 mb-4">{status}</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}