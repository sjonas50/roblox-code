/**
 * Direct Supabase client that bypasses the SDK
 * Workaround for React 19 compatibility issues
 */

interface DirectSupabaseClient {
  auth: {
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    getUser: () => Promise<any>;
  };
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: any[]; error: any }>;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<{ data: any; error: any }>;
    };
    delete: () => {
      eq: (column: string, value: any) => Promise<{ error: any }>;
    };
  };
}

export function createDirectClient(): DirectSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      const storedData = localStorage.getItem('direct-auth-session');
      if (storedData) {
        const session = JSON.parse(storedData);
        return session.access_token;
      }
    } catch (e) {
      console.error('Error getting auth token:', e);
    }
    return null;
  };

  // Get authenticated headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (token) {
      return {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return headers;
  };

  return {
    auth: {
      signIn: async (email: string, password: string) => {
        try {
          const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok && data.access_token) {
            // Store session
            localStorage.setItem('direct-auth-session', JSON.stringify(data));
            return { data: { user: data.user, session: data }, error: null };
          } else {
            return { data: null, error: { message: data.error_description || 'Sign in failed' } };
          }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          const response = await fetch(`${url}/auth/v1/signup`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            return { data: { user: data }, error: null };
          } else {
            return { data: null, error: { message: data.msg || 'Sign up failed' } };
          }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },

      signOut: async () => {
        localStorage.removeItem('direct-auth-session');
      },

      getUser: async () => {
        try {
          const token = getAuthToken();
          if (!token) {
            return { data: { user: null }, error: null };
          }

          const response = await fetch(`${url}/auth/v1/user`, {
            headers: getAuthHeaders()
          });

          if (response.ok) {
            const user = await response.json();
            return { data: { user }, error: null };
          } else {
            localStorage.removeItem('direct-auth-session');
            return { data: { user: null }, error: null };
          }
        } catch (error) {
          return { data: { user: null }, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      }
    },

    from: (table: string) => ({
      select: async (columns = '*') => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}?select=${columns}`, {
            headers: getAuthHeaders()
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data, error: null };
          } else {
            const error = await response.json();
            return { data: null, error };
          }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },

      insert: async (data: any) => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            const result = await response.json();
            return { data: result[0], error: null };
          } else {
            const error = await response.json();
            return { data: null, error };
          }
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },

      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              headers: getAuthHeaders(),
              body: JSON.stringify(data)
            });
            
            if (response.ok) {
              const result = await response.json();
              return { data: result[0], error: null };
            } else {
              const error = await response.json();
              return { data: null, error };
            }
          } catch (error) {
            return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
          }
        }
      }),

      delete: () => ({
        eq: async (column: string, value: any) => {
          try {
            const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            
            if (response.ok) {
              return { error: null };
            } else {
              const error = await response.json();
              return { error };
            }
          } catch (error) {
            return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
          }
        }
      })
    })
  };
}