import { createClient } from '@/lib/supabase/client';

/**
 * Wrapper for Supabase auth operations that handles the hanging promise issue
 */

export async function signInWithTimeout(
  email: string, 
  password: string,
  timeoutMs: number = 3000
): Promise<{ data: any; error: any }> {
  const supabase = createClient();
  
  // Create a timeout promise
  const timeoutPromise = new Promise<{ data: null; error: { message: string; code?: string } }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: null, 
        error: { 
          message: 'Authentication timeout - please wait...', 
          code: 'TIMEOUT' 
        } 
      });
    }, timeoutMs);
  });

  try {
    // Race between the actual sign in and the timeout
    const result = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      timeoutPromise
    ]);

    // If we got a timeout, check if authentication actually succeeded
    if (result.error && 'code' in result.error && result.error.code === 'TIMEOUT') {
      // Give it a moment for the auth state to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have a session now
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Authentication succeeded despite the timeout
        return { 
          data: { user: session.user, session }, 
          error: null 
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      } 
    };
  }
}

export async function checkAuthSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function refreshAuthSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('Session refresh error:', error);
    return null;
  }
  
  return session;
}