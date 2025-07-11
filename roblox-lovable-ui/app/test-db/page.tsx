"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestDatabasePage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    const supabase = createClient();
    const results: any = {};

    try {
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
      results.generalError = error instanceof Error ? error.message : 'Unknown error';
    }

    setStatus(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {loading ? (
        <p>Testing database connection...</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(status).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{key}</h2>
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setLoading(true);
          testDatabase();
        }}
        className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
      >
        Rerun Tests
      </button>
    </div>
  );
}