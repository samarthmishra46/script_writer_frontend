import React, { useState, useEffect } from 'react';
import { Plus, FileText, TrendingUp, Settings, LogOut, User, Sparkles, Crown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
  };
  usage: {
    scriptsGenerated: number;
    scriptsGeneratedThisMonth: number;
  };
}

interface Script {
  _id: string;
  title: string;
  type: string;
  industry: string;
  status: string;
  createdAt: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchUserScripts(token);
  }, [navigate]);

  const fetchUserScripts = async (token: string) => {
    try {
      const response = await fetch(buildApiUrl('api/scripts'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScripts(Array.isArray(data.scripts) ? data.scripts : []);
      } else {
        setScripts([]); // fallback if not ok
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setScripts([]); // fallback on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateScript = () => {
    navigate('/create-script');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ScriptWin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Create compelling ad scripts that convert with AI-powered assistance.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scripts</p>
                <p className="text-2xl font-bold text-gray-900">{user.usage.scriptsGenerated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{user.usage.scriptsGeneratedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user.subscription.plan}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscription</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {user.subscription?.plan || 'Free'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Alert for Free Users */}
        {(!user.subscription || user.subscription.plan === 'free') && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="text-blue-700 font-medium">Upgrade to Premium</p>
                <p className="text-blue-600 mt-1">Get unlimited script generation, advanced features, and priority support.</p>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateScript}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Create New Script</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/scripts')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">View All Scripts</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">View Analytics</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
              <div className="text-center">
                <Settings className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Account Settings</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Scripts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Scripts</h2>
            <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              View all
            </button>
          </div>
          
          {Array.isArray(scripts) && scripts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No scripts created yet</p>
              <button
                onClick={handleCreateScript}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first script
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(scripts) && scripts.slice(0, 5).map((script: Script) => (
                <div key={script._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div>
                    <h3 className="font-medium text-gray-900">{script.title}</h3>
                    <p className="text-sm text-gray-500">{script.type} • {script.industry}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      script.status === 'completed' ? 'bg-green-100 text-green-800' :
                      script.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {script.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(script.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 