import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ChevronDown, User, LogOut, Home } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

  // Handle click outside to close dropdown
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
                  Leepi AI
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
              <Link to="/contact" className="nav-item text-blue-600 transition-all duration-300 relative group px-4 py-2 rounded-lg font-semibold">
                <span className="relative z-10">Contact Us</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></span>
              </Link>
              <Link to="/about" className="nav-item text-gray-700 hover:text-pink-600 transition-all duration-300 relative group px-4 py-2 rounded-lg">
                <span className="relative z-10">About Us</span>
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
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-liquid-flow">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about Leepi AI? We're here to help! Reach out to our team and we'll get back to you soon.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-white/70 backdrop-blur-custom rounded-2xl p-8 shadow-lg border border-pink-100">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 btn-water"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white mr-4">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Us</h3>
                      <p className="text-gray-600">support@leepiAI.com</p>
                      <p className="text-gray-600">hello@leepiAI.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mr-4">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Call Us</h3>
                      <p className="text-gray-600">+91 98765 43210</p>
                      <p className="text-gray-600">+91 87654 32109</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mr-4">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Visit Us</h3>
                      <p className="text-gray-600">123 Innovation Street</p>
                      <p className="text-gray-600">Tech Park, Mumbai 400001</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-4">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Support */}
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-8 h-8 mr-3" />
                  <h3 className="text-xl font-semibold">Need Quick Support?</h3>
                </div>
                <p className="mb-4 text-white/90">
                  For urgent queries or technical support, use our live chat feature or WhatsApp us directly.
                </p>
                <div className="flex space-x-3">
                  <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium">
                    Live Chat
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
