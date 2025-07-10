import { createClient } from '@/lib/supabase/client';

export type AuthError = {
  message: string;
  status?: number;
};

export async function signUp(email: string, password: string, username?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  // Manually create profile since trigger might not work
  if (data.user) {
    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if profile was created by trigger
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();
    
    // Only create if it doesn't exist
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          username: username || null,
          subscription_tier: 'free',
          credits_remaining: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Still log the error but don't fail the signup
      }
    }
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function signInWithProvider(provider: 'google' | 'github' | 'discord') {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: true, error: null };
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function getUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getProfile() {
  const supabase = createClient();
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function updateProfile(updates: {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}) {
  const supabase = createClient();
  const user = await getUser();
  
  if (!user) {
    return { error: { message: 'Not authenticated' } };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}


// Check if email exists
export async function checkEmailExists(email: string) {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  return !!data;
}

// Check if username exists
export async function checkUsernameExists(username: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle(); // Use maybeSingle instead of single to handle no results

  // If there's an error (like 406), assume username is available
  if (error) {
    console.warn('Username check error:', error);
    return false;
  }

  return !!data;
}