import React from 'react';
import { Check, Star, Zap, Building } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our platform',
      icon: <Star className="w-6 h-6" />,
      features: [
        '5 script generations per month',
        'Basic templates',
        'Community support',
        'Export to text format',
      ],
      buttonText: 'Start Free',
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500',
      popular: false,
    },
    {
      name: 'Individual',
      price: '$29',
      period: 'per month',
      description: 'For freelancers and small teams',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Unlimited script generations',
        'Premium templates',
        'Priority support',
        'Export to multiple formats',
        'Advanced AI models',
        'Custom brand voice',
      ],
      buttonText: 'Start Individual',
      buttonStyle: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
      popular: true,
    },
    {
      name: 'Organization',
      price: '$99',
      period: 'per month',
      description: 'For teams and enterprises',
      icon: <Building className="w-6 h-6" />,
      features: [
        'Everything in Individual',
        'Team collaboration tools',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        'SSO authentication',
        'API access',
      ],
      buttonText: 'Start Organization',
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core features 
            with no hidden fees or surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 ring-blue-500 transform scale-105' 
                  : 'hover:transform hover:scale-105'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/ {plan.period}</span>
                </div>

                <p className="text-gray-600 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom solution? We're here to help.
          </p>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300">
            Contact Sales →
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;