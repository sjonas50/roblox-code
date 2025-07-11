"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestDatabasePage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TestDatabasePage mounted');
    testDatabase();
  }, []);

  const testDatabase = async () => {
    console.log('Starting database tests...');
    setError(null);
    
    try {
      const supabase = createClient();
      const results: any = {};
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.auth = {
        success: !!user,
        userId: user?.id,
        error: authError?.message
      };

      if (user) {
        // Test 2: Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        results.profile = {
          success: !!profile,
          data: profile,
          error: profileError?.message
        };

        // Test 3: Check projects table
        const { data: projects, error: projectsError, count } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        
        results.projects = {
          success: !projectsError,
          count: count || 0,
          data: projects,
          error: projectsError?.message
        };

        // Test 4: Check if we can create a test project
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            name: 'Test Project',
            description: 'Testing database connection',
            user_id: user.id
          })
          .select()
          .single();
        
        results.createProject = {
          success: !createError,
          data: newProject,
          error: createError?.message
        };

        // If project was created, test scripts
        if (newProject) {
          // Test 5: Check scripts table
          const { data: scripts, error: scriptsError } = await supabase
            .from('scripts')
            .select('*')
            .eq('project_id', newProject.id);
          
          results.scripts = {
            success: !scriptsError,
            count: scripts?.length || 0,
            error: scriptsError?.message
          };

          // Test 6: Create a test script
          const { data: newScript, error: scriptCreateError } = await supabase
            .from('scripts')
            .insert({
              project_id: newProject.id,
              name: 'Test Script',
              type: 'server',
              content: '-- Test content'
            })
            .select()
            .single();
          
          results.createScript = {
            success: !scriptCreateError,
            data: newScript,
            error: scriptCreateError?.message
          };

          // Clean up - delete test data
          if (newScript) {
            await supabase.from('scripts').delete().eq('id', newScript.id);
          }
          await supabase.from('projects').delete().eq('id', newProject.id);
        }
      }
    } catch (error) {
      console.error('Test database error:', error);
      results.generalError = error instanceof Error ? error.message : 'Unknown error';
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }

    console.log('Test results:', results);
    setStatus(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}
      
      {loading ? (
        <div>
          <p className="mb-4">Testing database connection...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(status).length === 0 ? (
            <p className="text-gray-400">No test results. Check browser console for errors.</p>
          ) : (
            Object.entries(status).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">{key}</h2>
                <pre className="text-sm text-gray-300 overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => {
          console.log('Rerunning tests...');
          setLoading(true);
          testDatabase();
        }}
        className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
      >
        Rerun Tests
      </button>
      
      <div className="mt-8 text-sm text-gray-400">
        <p>Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
}