"use client";

import { useState } from 'react';

export default function DirectTestPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Test Page - No Auth</h1>
      <p className="mb-4">This page tests basic React functionality without any auth or database calls.</p>
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-lg mb-2">Counter: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded mr-2"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
        >
          Reset
        </button>
      </div>
      <div className="mt-8 text-sm text-gray-400">
        <p>If you can see this page and interact with the counter, React is working correctly.</p>
        <p>If not, check the browser console for errors.</p>
      </div>
    </div>
  );
}