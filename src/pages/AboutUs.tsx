import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Zap, Target, Shield, Rocket,TrendingUp, Award, CheckCircle } from 'lucide-react';
import Header from '../components/HeaderLanding';

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
  const [user, setUser] = useState<User | null>(null);
  
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

  const beliefs = [
    "Direct response > decoration. Every line must earn revenue.",
    "Script is the product. Hook, angle, promise, proof—get these right and ROAS follows.",
    "Native or nothing. Ads should feel like content your buyer already consumes.",
    "Data + taste. Spend-level signals guided by human judgment—not templates.",
    "Speed wins. 20 strong options today beat one \"perfect\" ad next week.",
    "Skin in the game. 3 winners or money back."
  ];

  const features = [
    {
      title: "20 Winners, On Demand",
      description: "Ideas, angles, hooks, full scripts, storyboards.",
      icon: <Trophy className="w-6 h-6" />
    },
    {
      title: "Zero Guesswork",
      description: "You share offer, buyer, proof. We decide tone, format, and style.",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Category-Aware Intelligence",
      description: "Trained on outcomes from ₹50Cr+ of Meta spend; understands the difference between jewellery UGC and B2B SaaS explainers.",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Shoot-Ready",
      description: "Frame-by-frame directions (camera, on-screen copy, VO) your team can film tomorrow.",
      icon: <Rocket className="w-6 h-6" />
    }
  ];

  const reasons = [
    {
      title: "Performance first",
      description: "Built for sales & lead gen, not vanity metrics.",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Guarantee",
      description: "At least 3 winners out of 20—or a full refund.",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Faster than an agency brief",
      description: "Inputs in minutes, outputs same session.",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Proven across categories",
      description: "D2C, edtech, real estate, B2B—native to Meta in 2025.",
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Header
        user={user}
        getUserFirstName={getUserFirstName}
        handleLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
           
            <h2 className=" mb-1 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              We don't "write copy." 
              <br />We <span className="text-purple-600">mint winners.</span>
            </h2>
            <div className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Leepi AI turns raw product truth into <span className="font-bold text-purple-600">20 Meta-native ad ideas, hooks, scripts, and frame-by-frame storyboards</span>—in minutes. No tone-pickers. No format guesswork. Just <span className="font-bold">scroll-stopping, money-moving creatives</span> designed to raise ROAS.
              </p>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full inline-block font-bold text-lg shadow-lg">
                <span className="text-2xl">3 winners guaranteed or 100% refund.</span>
              </div>
              <p className="text-sm text-gray-600 italic">
                (When performance matters, guarantees speak.)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-purple-100">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                We started as <span className="font-bold text-purple-600">Yuvichaar Funnels</span>, shipping founder-led, UGC-first ads that scaled brands. After managing <span className="font-bold text-green-600">₹50Cr+ in ad spend</span> and contributing to <span className="font-bold text-green-600">₹130Cr+ in tracked revenue</span>, we codified what worked into a product. Leepi AI is that playbook—<span className="font-bold">an engine that thinks like a strategist, writes like a top copywriter, and plans shots like a creative director</span>.
              </p>
              <p>
                Used to ideate and strategize <span className="font-bold text-purple-600">1,000+ ads</span> across <span className="font-bold">VC-backed & Shark Tank-funded D2C, ecommerce, B2B, edtech, and real estate</span> brands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            What We Believe
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {beliefs.map((belief, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium">{belief}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Built Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            What We Built
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Brands Choose Us Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Brands Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white mb-4">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Our Promise Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#E1E7FB] via-[#F8EBEF] to-[#FAF3ED]   rounded-3xl p-12 text-black shadow-2xl"
          >
            <h2 className="relative text-4xl font-bold mb-8">Our Promise</h2>
            <div className="space-y-6 text-xl leading-relaxed">
              <p>You're probably <span className="font-bold text-yellow-300">one ad away</span> from your next revenue jump.</p>
              <p>Leepi AI gives you <span className="font-bold text-yellow-300">twenty</span>.</p>
              <div className="text-2xl font-bold space-y-2">
                <p><span className="text-green-300">Try it.</span> <span className="text-blue-300">Shoot it.</span> <span className="text-pink-300">Publish it.</span></p>
                <p>Then watch the dashboard turn <span className="text-green-300">green</span>.</p>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                Start Creating Winners
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#9F6AEA] to-purple-600  backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-300 border-2 border-white/30 text-lg"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
