import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCreateScript = () => {
    navigate('/create-script');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-800">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-yellow-300 mr-2" />
          <span className="text-yellow-300 font-medium">AI-Powered Script Writing</span>
        </div>
        
        {isAuthenticated ? (
          // Authenticated User Content
          <>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Welcome back,
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                {user?.name}!
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ready to create your next winning ad script? 
              Let's turn your ideas into compelling campaigns that convert.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleCreateScript}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg group"
              >
                <Plus className="w-5 h-5 mr-2 inline-block" />
                Create New Script
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="mt-8 text-blue-100">
              <p className="text-sm">
                You've generated {user?.usage?.scriptsGenerated || 0} scripts this month
              </p>
            </div>
          </>
        ) : (
          // Non-authenticated User Content
          <>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                ADs Script That
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Win
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create compelling ad scripts that convert with our AI-powered platform. 
              Turn your ideas into winning campaigns that drive results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105">
                Watch Demo
              </button>
            </div>
            
            <div className="mt-12 text-blue-100">
              <p className="text-sm">Trusted by 10,000+ marketers worldwide</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;