import React from 'react';
import GoogleAuthTester from '../components/GoogleAuthTester';

const GoogleAuthTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google OAuth Test Page</h1>
          <p className="mt-2 text-gray-600">
            Use this page to verify Google authentication is properly configured
          </p>
        </div>
        
        <GoogleAuthTester />
        
        <div className="mt-12 text-center">
          <a 
            href="/login" 
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Return to Login Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTestPage;
