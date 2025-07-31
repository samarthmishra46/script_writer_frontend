import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Crown, ChevronDown } from 'lucide-react';

interface UserSubscription {
  plan: string;
}

interface UserData {
  name: string;
  subscription?: UserSubscription;
}

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ScriptWin</span>
          </div>
          
          {user ? (
            // Show profile menu when user is logged in
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
                <span className="text-sm font-medium">{user.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                {/* Subscription Status */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Subscription Plan</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user?.subscription?.plan || 'Free'}
                  </p>
                </div>

                {/* Upgrade Button for Free Users */}
                {(!user?.subscription || user.subscription.plan === 'free') && (
                  <button
                    onClick={() => {
                      navigate('/subscription');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
              </div>
            )}
          </div>
          ) : (
            // Show login button when no user is logged in
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;