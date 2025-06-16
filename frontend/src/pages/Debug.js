import React from 'react';
import { useAuth } from '../context/AuthContext';

const Debug = () => {
  const { isAuthenticated, loading, user, token } = useAuth();
  
  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Authentication State</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
          </div>
          <div>
            <strong>Token:</strong> {token ? 'Present' : 'null'}
          </div>
          <div>
            <strong>LocalStorage Token:</strong> {localStorage.getItem('token') || 'null'}
          </div>
          <div>
            <strong>LocalStorage User:</strong> {localStorage.getItem('user') || 'null'}
          </div>
          <div>
            <strong>Current URL:</strong> {window.location.href}
          </div>
        </div>
        
        <div className="mt-6 space-x-4">
          <button 
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Storage & Reload
          </button>
          <a 
            href="/register" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Go to Register
          </a>
          <a 
            href="/login" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Debug;
