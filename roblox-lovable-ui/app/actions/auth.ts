"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function forceLogout() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Get all cookies
  const allCookies = cookieStore.getAll();
  
  // Clear all Supabase related cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('sb-') || 
        cookie.name.includes('supabase') || 
        cookie.name.includes('auth')) {
      cookieStore.delete(cookie.name);
    }
  });
  
  // Also explicitly delete common Supabase cookie patterns
  const commonPatterns = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase-auth-token'
  ];
  
  commonPatterns.forEach(pattern => {
    try {
      cookieStore.delete(pattern);
    } catch (e) {
      // Cookie might not exist, that's okay
    }
  });
  
  redirect('/');
}