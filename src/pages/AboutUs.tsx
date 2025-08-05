import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Target, Award, Lightbulb, Heart, Zap, Star, TrendingUp, ChevronDown, User, LogOut, Home } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
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

  const team = [
    {
      name: "Priya Sharma",
      role: "CEO & Founder",
      image: "👩‍💼",
      bio: "Former Meta marketing executive with 10+ years in AI and digital advertising."
    },
    {
      name: "Arjun Patel",
      role: "CTO",
      image: "👨‍💻",
      bio: "AI researcher and former Google engineer specializing in natural language processing."
    },
    {
      name: "Sneha Gupta",
      role: "Head of Marketing",
      image: "👩‍🎨",
      bio: "Award-winning marketer who has generated over ₹100Cr in ad revenue for top brands."
    },
    {
      name: "Rahul Singh",
      role: "Head of AI",
      image: "👨‍🔬",
      bio: "PhD in Machine Learning with expertise in conversational AI and content generation."
    }
  ];

  const values = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We constantly push the boundaries of AI technology to deliver cutting-edge solutions.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer-Centric",
      description: "Every feature we build is designed with our users' success and growth in mind.",
      color: "from-pink-500 to-red-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Results-Driven",
      description: "We measure our success by the measurable impact we create for our customers.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaboration",
      description: "We believe in the power of teamwork and building strong partnerships.",
      color: "from-green-500 to-teal-500"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
    { number: "1M+", label: "Scripts Generated", icon: <Zap className="w-6 h-6" /> },
    { number: "₹50Cr+", label: "Ad Spend Analyzed", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Award className="w-6 h-6" /> }
  ];

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

      {/* Header */}
      <header className="relative z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="group">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 animate-liquid-flow">
                  Ravya AI
                </h1>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/" className="nav-item text-gray-700 hover:text-pink-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Home</span>
              </Link>
              <Link to="/pricing" className="nav-item text-gray-700 hover:text-purple-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Pricing</span>
              </Link>
              <Link to="/contact" className="nav-item text-gray-700 hover:text-blue-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">Contact Us</span>
              </Link>
              <Link to="/about" className="nav-item text-pink-600 transition-all duration-300 relative group px-4 py-2 rounded-lg font-semibold">
                <span className="relative z-10">About Us</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600"></span>
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative z-[10000]" ref={userDropdownRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-pink-500/30 hover:via-purple-500/30 hover:to-blue-500/30 transition-all duration-300 relative z-[10001]"
                  >
                    <User className="w-4 h-4" />
                    <span>{getUserFirstName()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-[10002]"
                      style={{ 
                        pointerEvents: 'auto',
                        position: 'absolute',
                        zIndex: 10002
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsUserDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer relative z-[10003]"
                        style={{ 
                          pointerEvents: 'auto',
                          zIndex: 10003,
                          position: 'relative'
                        }}
                      >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer relative z-[10003]"
                        style={{ 
                          pointerEvents: 'auto',
                          zIndex: 10003,
                          position: 'relative'
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
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
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-liquid-flow">
            About Ravya AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize high-converting ad script creation through the power of artificial intelligence. 
            Founded by marketing veterans and AI experts, we're transforming how businesses create compelling advertising content.
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Trusted by industry leaders</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ravya AI was born from a simple observation: creating high-converting ad scripts was taking too long and costing too much. 
                  Our founders, who had collectively managed over ₹50 crores in ad spend, knew there had to be a better way.
                </p>
                <p>
                  After analyzing thousands of successful campaigns across industries, we discovered patterns that could be encoded into AI. 
                  We spent two years training our models on the most successful ad campaigns, working with top marketers and copywriters.
                </p>
                <p>
                  Today, Ravya AI has helped over 10,000 businesses create compelling ad scripts that convert. From startups to Fortune 500 companies, 
                  our AI-powered platform has become the go-to solution for marketers who want results fast.
                </p>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-custom rounded-2xl p-8 shadow-lg border border-pink-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                To empower every business, regardless of size or budget, with AI-powered tools that create 
                high-converting advertising content in seconds, not hours.
              </p>
              
              <h3 className="text-xl font-bold mb-4 text-gray-900">Our Vision</h3>
              <p className="text-gray-600">
                A world where creating compelling, conversion-focused advertising content is accessible to everyone, 
                democratizing effective marketing through artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Our Values
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-pink-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Advertising?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of marketers who are already creating winning ad scripts with Ravya AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
