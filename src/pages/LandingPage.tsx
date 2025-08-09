import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, Star, Zap, ChevronDown, User, LogOut, Home } from 'lucide-react';
interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const getUserFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return 'User';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Create ripple effect on mouse move
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };
      
      setRipples(prev => [...prev.slice(-5), newRipple]); // Keep only last 5 ripples
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Clean up old ripples
    const cleanup = setInterval(() => {
      setRipples(prev => prev.filter(ripple => Date.now() - ripple.timestamp < 2000));
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanup);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cloudy Background */}
      <div className="cloudy-background"></div>
      
      {/* Mouse-following gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(255, 192, 203, 0.2), 
              rgba(173, 216, 230, 0.15), 
              transparent 40%)
          `,
        }}
      />
      
      {/* Water Ripple Effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 192, 203, 0.4) 0%, rgba(173, 216, 230, 0.3) 30%, transparent 70%)',
            animation: 'ripple 2s ease-out forwards',
            zIndex: 1
          }}
        />
      ))}
      
      {/* Animated water-like wave effect */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at ${mousePosition.x * 0.5}px ${mousePosition.y * 0.3}px, 
                rgba(255, 192, 203, 0.1) 0%, 
                transparent 50%),
              radial-gradient(ellipse at ${mousePosition.x * 0.8}px ${mousePosition.y * 0.7}px, 
                rgba(173, 216, 230, 0.08) 0%, 
                transparent 50%)`,
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>
      {/* Animated Background Elements with Water-like Movement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-pink-200 via-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${Math.sin(Date.now() / 3000) * 20}px, ${Math.cos(Date.now() / 4000) * 15}px)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 via-pink-200 to-purple-200 rounded-full opacity-15 blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${Math.sin(Date.now() / 2500) * -25}px, ${Math.cos(Date.now() / 3500) * 20}px)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 rounded-full opacity-10 blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${Math.sin(Date.now() / 4000) * 30}px, ${Math.cos(Date.now() / 2000) * -10}px)`,
            animation: 'float 10s ease-in-out infinite'
          }}
        ></div>
        
        {/* Additional floating elements for water effect */}
        <div 
          className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-r from-pink-300 to-blue-300 rounded-full opacity-5 blur-2xl"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.03}px)`,
            transition: 'transform 0.6s ease-out'
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-blue-300 to-pink-300 rounded-full opacity-8 blur-2xl"
          style={{
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * 0.04}px)`,
            transition: 'transform 0.8s ease-out'
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 animate-liquid-flow">
                  Leepi AI
                </h1>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/" className="nav-item text-gray-700 hover:text-pink-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Home</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 group-hover:w-full group-hover:left-0 transition-all duration-500"></span>
              </Link>
              <Link to="/pricing" className="nav-item text-gray-700 hover:text-purple-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Pricing</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 group-hover:w-full group-hover:left-0 transition-all duration-500"></span>
              </Link>
              <Link to="/contact" className="nav-item text-gray-700 hover:text-blue-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Contact Us</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 group-hover:w-full group-hover:left-0 transition-all duration-500"></span>
              </Link>
              <Link to="/about" className="nav-item text-gray-700 hover:text-pink-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">About Us</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 group-hover:w-full group-hover:left-0 transition-all duration-500"></span>
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative z-[10000]" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 font-medium text-gray-700 relative z-[10001]"
                  >
                    <User className="w-5 h-5" />
                    <span>{getUserFirstName()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[10002]"
                      style={{ 
                        pointerEvents: 'auto',
                        position: 'absolute',
                        zIndex: 10002
                      }}
                    >
                      <div className="py-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsUserDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer relative z-[10003]"
                          style={{ 
                            pointerEvents: 'auto',
                            zIndex: 10003,
                            position: 'relative'
                          }}
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer relative z-[10003]"
                          style={{ 
                            pointerEvents: 'auto',
                            zIndex: 10003,
                            position: 'relative'
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="nav-item text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-lg relative">
                    <span className="relative z-10">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 transform btn-water animate-liquid-flow font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 group">
            <p className="text-sm text-pink-600 mb-2 font-medium tracking-wide uppercase">Product Of</p>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent mb-4 transition-all duration-300 group-hover:scale-105">
              Yuvichaar Funnels
            </h2>
            <div className="relative inline-block">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-6 transition-all duration-300 hover:scale-105">
                Leepi AI
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight hover:text-purple-700 transition-colors duration-300">
            Get ROAS Exploding Ad Ideas <div className="inline text-purple-700 hover:text-grey-900 transition-colors duration-300">With</div> Angles, Hooks Scripts, & Storyboards For Meta Ads in Minutes
          </h2>
          <h4 className="text-2xl text-gray-900 mb-8 leading-tight hover:text-purple-700 transition-colors duration-300">
            Your Dream ROAS, Dream Revenue Milestone Might Just Be One Winning Ad Script Away!
          </h4>
          
          {/* Added storyboard image */}
          <div className="mb-10">
            <img 
              src="../../dist/assets/landingPage1.png"
              alt="Storyboard and Final Ad Example" 
              className="mx-auto rounded-lg shadow-xl max-w-full h-auto border border-purple-100"
              
            />
            <p className="text-sm text-gray-500 mt-3">
              From storyboard to final ad: See how Leepi AI helps create compelling visual content
            </p>
          </div>
          
          <div className="relative inline-block group mb-8">
            <Link
              to="/login"
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
              style={{ zIndex: 1 }}
            >
              <span className="absolute inset-0" style={{ zIndex: 2 }}></span>
              <span className="flex items-center relative z-10 pointer-events-auto">
              <Zap className="mr-2 w-5 h-5" />
              Try For 30 Days At Just Rs.1999
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg animate-water-wave"></div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Rated 5/5 by 1000+ marketers</span>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Wrote 1000+ Winning Ads For Meta, Trained On Rs. 50Cr+ Of Ad Spend Data!
          </p>
        </div>
      </section>

      

      {/* NEW: "Is Not Just A ChatGPT Wrapper" Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8 border border-purple-100">
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-6 transition-all duration-300 hover:scale-105">
                Leepi AI
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>
            <h3 className="px-2 text-3xl font-bold   text-center leading-snug">
              Is Not Just A ChatGPT Wrapper,<br />
              It's Trained On<br />
              Rs. 50Cr Of Meta Ad Spend
            </h3>

            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              It Understands
            </p>
          </div>
          
            <div className="space-y-4 mb-9">
            <div className="flex flex-wrap gap-4 justify-center">
              {["Copywriting", "Performance Marketing", "Video Ads"].map((tag, index) => (
              <div key={index} className="bg-purple-50 rounded-full px-4 py-2 text-center text-l text-purple-700 font-medium">
                {tag}
              </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {["Conversion Optimization", "Creative Strategy"].map((tag, index) => (
              <div key={index} className="bg-purple-50 rounded-full px-4 py-2 text-center text-l text-purple-700 font-medium">
                {tag}
              </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {["Brand Storytelling", "Ad Angles", "Hook Ideas"].map((tag, index) => (
              <div key={index} className="bg-purple-50 rounded-full px-4 py-2 text-center text-l text-purple-700 font-medium">
                {tag}
              </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {["Consumer psychology"].map((tag, index) => (
              <div key={index} className="bg-purple-50 rounded-full px-4 py-2 text-center text-l text-purple-700 font-medium">
                {tag}
              </div>
              ))}
            </div>
            </div>
          
          <div className="flex justify-center my-8">
            <Link
              to="/login"
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
              style={{ zIndex: 1 }}
            >
              <span className="absolute inset-0" style={{ zIndex: 2 }}></span>
              <span className="flex items-center relative z-10 pointer-events-auto">
              <Zap className="mr-2 w-5 h-5" />
              Try For 30 Days At Just Rs.1999
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      
      

      {/* NEW: "Leepi AI Has Written & Ideated 1000+ Ads" Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto text-center">
           <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-6 transition-all duration-300 hover:scale-105">
                Leepi AI
              </h1>
          <h3 className="text-3xl font-bold mb-8  bg-clip-text ">
             Has Written & Ideated <span className="text-purple-600">1000+</span> Ads For Dozens of Brands
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 mb-12">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">Logo {i+1}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-10">
            <Link
              to="/login"
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
              style={{ zIndex: 1 }}
            >
              <span className="absolute inset-0" style={{ zIndex: 2 }}></span>
              <span className="flex items-center relative z-10 pointer-events-auto">
              <Zap className="mr-2 w-5 h-5" />
              Try For 30 Days At Just Rs.1999
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: "Ads Written by Leepi AI That Break Writer's Block" Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ads Written by Leepi AI That Break Writer's Block
            </h2>
          </div>
          
          <div className="grid md:grid-rows-2 gap-8">
            {/* Ad Example 1 */}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-purple-100">

  {/* Brand Name Row */}
  <div className="md:col-span-3 text-center">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
    Brand: Arabian Aroma
    </h2>
  </div>

  {/* Final Ad */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Final Ad
    </h3>
    <div>
      <iframe
        src="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
        className="w-[220px] h-[300px] sm:w-[280px] sm:h-[400px] md:w-[340px] md:h-[500px]"
        allow="autoplay"
      ></iframe>
    </div>
  </div>

  {/* Ad Script */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Ad Script
    </h3>
    <div>
      <img
        src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
        alt="Ad Script"
        className="w-[220px] sm:w-[280px] md:w-[340px] rounded-lg shadow"
      />
    </div>
  </div>

  {/* Results */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Results
    </h3>
    <div>
      <img
        src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
        alt="Results"
        className="w-[220px] sm:w-[280px] md:w-[340px] rounded-lg shadow"
      />
    </div>
  </div>

</div>

            
            {/* Ad Example 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-purple-100">

  {/* Brand Name Row */}
  <div className="md:col-span-3 text-center">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
      Your Brand Name
    </h2>
  </div>

  {/* Final Ad */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Final Ad
    </h3>
    <div>
      <iframe
        src="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
        className="w-[220px] h-[300px] sm:w-[280px] sm:h-[400px] md:w-[340px] md:h-[500px]"
        allow="autoplay"
      ></iframe>
    </div>
  </div>

  {/* Ad Script */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Ad Script
    </h3>
    <div>
      <img
        src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
        alt="Ad Script"
        className="w-[220px] sm:w-[280px] md:w-[340px] rounded-lg shadow"
      />
    </div>
  </div>

  {/* Results */}
  <div className="flex flex-col gap-4 items-center">
    <h3 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
      Results
    </h3>
    <div>
      <img
        src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
        alt="Results"
        className="w-[220px] sm:w-[280px] md:w-[340px] rounded-lg shadow"
      />
    </div>
  </div>



</div>

          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/login"
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
              style={{ zIndex: 1 }}
            >
              <span className="absolute inset-0" style={{ zIndex: 2 }}></span>
              <span className="flex items-center relative z-10 pointer-events-auto">
              <Zap className="mr-2 w-5 h-5" />
              Try For 30 Days At Just Rs.1999
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: How Leepi AI Works */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How Leepi AI Works
            </h3>
          </div>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  1
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">Step 1: Tell us about your product or offer</h4>
                <p className="text-gray-600 mb-4">
                  Provide details about your product, service, or offer. The more details you provide, the better the results.
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-20 bg-purple-500 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  2
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">Step 2: That's it, simply wait for your ad scripts</h4>
                <p className="text-gray-600 mb-4">
                  Our AI generates high-converting ad scripts based on your input and our database of successful ads.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  3
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">Step 3: Use the scripts in your ad campaigns</h4>
                <p className="text-gray-600 mb-4">
                  Copy the generated scripts directly into your Facebook or Instagram ad campaigns and watch your conversions grow.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-100 rounded-lg"></div>
                  <div className="h-24 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg text-lg font-medium"
            >
              Try For 30 Days At Just Rs.1999
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: 100% Money Back Guarantee */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Promise
            </h1>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <div className="w-40 h-40 bg-yellow-400 rounded-full opacity-20"></div>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-6 relative z-10">
              100% Money Back Guarantee
            </h3>
            
            <div className="mb-8 relative z-10">
              <div className="w-42 h-42 mx-auto  rounded-full flex items-center justify-center ">
                <div className="text-center">
                  <img src="../../dist/assets/image_90.png" alt="" />
                </div>
              </div>
            </div>
            
            <p className="text-white text-lg mb-8 max-w-xl mx-auto relative z-10">
              "At least 3 of those scripts will be winners. Or you get your money back. No questions asked. Use the ideas with your in-house team, give them to a freelancer, or shoot it yourself. You now have a plug-and-play creative strategy that can change your business."
            </p>
            
            <Link
              to="/signup"
              className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg text-lg font-bold relative z-10"
            >
              Try For 30 Days 
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-liquid-flow">
              Why Choose Leepi AI?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform creates winning ad scripts that convert, backed by real data and proven results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚀",
                title: "Lightning Fast",
                description: "Generate high-converting ad scripts in seconds, not hours"
              },
              {
                icon: "🎯",
                title: "Data-Driven",
                description: "Trained on Rs. 50Cr+ of successful ad spend data"
              },
              {
                icon: "✨",
                title: "Proven Results",
                description: "1000+ winning ads created for leading brands"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-custom rounded-xl p-8 shadow-lg border border-pink-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 cursor-pointer water-effect hover-lift"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:animate-glow">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-gray-900 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:via-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            Ready to Create Winning Ad Scripts?
          </h3>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of marketers who are saving time and getting better results with Leepi AI.
          </p>
          <div className="relative inline-block group">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
            >
              Get Started 
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg animate-water-wave"></div>
          </div>
          <p className="mt-4 text-gray-500">
            No credit card required • Free plan available
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;