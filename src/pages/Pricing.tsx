import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, User } from 'lucide-react';
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

const Pricing: React.FC = () => {
  const navigate = useNavigate();
 
 
  const [user, setUser] = useState<User | null>(null);
 
 

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle click outside dropdown
 

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


  const plans = [
    {
      name: "Individual",
      price: "₹1,999",
      originalPrice: "₹4,999",
      period: "/month",
      description: "For serious marketers and entrepreneurs",
      features: [
        "Unlimited AI-generated scripts",
        "Premium script templates",
        "Priority email & chat support",
        "Lightning-fast processing",
        "Advanced analytics & insights",
        "Custom tone & style options",
        "Export in multiple formats",
        "Script performance tracking",
        "A/B testing capabilities",
        "Industry-specific templates"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-pink-500 via-purple-500 to-blue-500",
      buttonText: "Start Free Trial",
      popular: true,
      discount: "60% OFF"
    },
    {
      name: "Enterprise",
      price: "Custom",
      originalPrice: "",
      period: "",
      description: "For large teams and agencies",
      features: [
        "Everything in Individual",
        "Team collaboration tools",
        "White-label solutions",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced reporting",
        "SLA guarantee",
        "Training & onboarding",
        "Custom AI model training",
        "Priority feature requests"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      buttonText: "Contact Sales",
      popular: false,
      discount: ""
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
       {/* Header */}
            
            <Header
                        user={user}
                        getUserFirstName={getUserFirstName}
                        handleLogout={handleLogout}
                      />
      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-liquid-flow">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your advertising with our AI-powered script generation. Start with a free trial and see the results immediately.
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-12">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Trusted by 10,000+ marketers</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 justify-center pt-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative group bg-white/70 backdrop-blur-custom rounded-2xl p-8 shadow-lg border border-pink-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 cursor-pointer water-effect hover-lift ${plan.popular ? 'ring-2 ring-pink-500 scale-105' : ''} mt-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className=" text-black px-6 py-4  text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 rounded-full text-xs font-semibold shadow-lg transform rotate-14 whitespace-nowrap">
                      {plan.discount}
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-500 group-hover:animate-glow`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <div className="text-lg text-gray-400 line-through mb-1">
                        {plan.originalPrice}
                      </div>
                    )}
                    <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                    {plan.originalPrice && (
                      <div className="text-sm text-green-600 font-semibold mt-1">
                        Save ₹{Number(plan.originalPrice.replace(/[^0-9]/g, '')) - Number(plan.price.replace(/[^0-9]/g, ''))} per month!
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-8">{plan.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-left">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-blue-600' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What happens after my free trial ends?",
                answer: "After your free trial, you can continue with the free plan (3 scripts/month) or upgrade to Individual for unlimited access."
              },
              {
                question: "Can I change my plan anytime?",
                answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time from your account settings."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, UPI, net banking, and digital wallets for your convenience."
              },
              {
                question: "Is there a refund policy?",
                answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-custom rounded-xl p-6 shadow-lg border border-pink-100">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
