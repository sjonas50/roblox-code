"use client";

export default function TestEnvPage() {
  // Check if environment variables are accessible
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
          <p className="text-sm text-gray-300 break-all">
            {supabaseUrl ? (
              <span className="text-green-400">✓ Set: {supabaseUrl}</span>
            ) : (
              <span className="text-red-400">✗ Not set</span>
            )}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
          <p className="text-sm text-gray-300">
            {supabaseAnonKey ? (
              <span className="text-green-400">✓ Set (length: {supabaseAnonKey.length})</span>
            ) : (
              <span className="text-red-400">✗ Not set</span>
            )}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Instructions if missing:</h2>
          <ol className="text-sm text-gray-300 list-decimal list-inside space-y-2">
            <li>Create a file named <code className="bg-gray-700 px-1 rounded">.env.local</code> in the project root</li>
            <li>Add your Supabase credentials:</li>
            <pre className="bg-gray-700 p-2 rounded mt-2 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
            </pre>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    </div>
  );
}