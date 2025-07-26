import React, { useEffect, useState } from 'react';

const ClientsSection = () => {
  const [visibleLogos, setVisibleLogos] = useState<boolean[]>([]);

  const clients = [
    { name: 'TechCorp', logo: 'https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { name: 'InnovateLab', logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { name: 'CreativeStudio', logo: 'https://images.pexels.com/photos/3184470/pexels-photo-3184470.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { name: 'DigitalFlow', logo: 'https://images.pexels.com/photos/3184475/pexels-photo-3184475.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { name: 'BrandForge', logo: 'https://images.pexels.com/photos/3184480/pexels-photo-3184480.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { name: 'MarketPro', logo: 'https://images.pexels.com/photos/3184485/pexels-photo-3184485.jpeg?auto=compress&cs=tinysrgb&w=200' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate logos one by one
            clients.forEach((_, index) => {
              setTimeout(() => {
                setVisibleLogos((prev) => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const section = document.getElementById('clients-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="clients-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side text */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Our Clients
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Trusted by leading brands worldwide to create compelling ad scripts 
              that drive engagement and conversions. Join thousands of satisfied 
              customers who've transformed their marketing with our AI-powered platform.
            </p>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="text-2xl font-bold text-blue-600">10,000+</div>
              <div>Active Users</div>
            </div>
          </div>

          {/* Right side logos */}
          <div className="grid grid-cols-2 gap-8">
            {clients.map((client, index) => (
              <div
                key={client.name}
                className={`flex items-center justify-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-500 ${
                  visibleLogos[index] 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                }`}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {client.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;