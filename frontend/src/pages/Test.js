import React from 'react';

const Test = () => {
  console.log('Test component rendered successfully!');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">TEST PAGE</h1>
        <p className="text-gray-700">
          If you can see this page, routing is working correctly.
        </p>
        <div className="mt-4 space-y-2">
          <a href="/login" className="block text-blue-600 hover:underline">Go to Login</a>
          <a href="/register" className="block text-blue-600 hover:underline">Go to Register</a>
          <a href="/debug" className="block text-blue-600 hover:underline">Go to Debug</a>
        </div>
      </div>
    </div>
  );
};

export default Test;
