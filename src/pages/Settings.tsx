import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings as SettingsIcon, Mail, Calendar, FileText, 
  Crown, ChevronDown, ChevronUp, Menu, AlertTriangle,
  Edit2, Save, CheckCircle, LogOut
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { buildApiUrl } from '../config/api';
import { useBrands } from '../context/useBrands';

// We don't need the Script interface anymore

// Using the same Brand interface as defined in BrandsContext
interface Brand {
  name: string;
  products: string[];
  id: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    plan: string;
    status: string;
    expiresAt?: string;
    startDate?: string;
  };
  usage: {
    scriptsGenerated: number;
    scriptsGeneratedThisMonth: number;
    storyboardsGenerated: number;
    lastResetDate?: string;
  };
  authProvider?: string; // Add this field to track authentication provider
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Brand data for sidebar
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
    // Sidebar refresh trigger
  const brandsContext = useBrands(); // Keep context reference even if not directly used
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);


  
  // Function to fetch brands for sidebar - matching CreateScriptWizard implementation
  const fetchBrands = async () => {
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBrandsError('Authentication required');
        return;
      }

      const response = await fetch(buildApiUrl('api/brands/all'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.brands)) {
        setBrands(data.brands);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrandsError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setBrandsLoading(false);
    }
  };


  
  // Fetch user data and brands data for sidebar - matching CreateScriptWizard implementation
  useEffect(() => {
    fetchUserProfile();
    fetchBrands();
    
    // Refresh sidebar when component mounts
    setSidebarRefreshTrigger(prev => prev + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(buildApiUrl('api/users/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const result = await response.json();
      const userData = result.success ? result.data : result;
      
      setUser(userData);
      setNameInput(userData.name);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpdateProfile = async () => {
    if (!nameInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(buildApiUrl('api/users/update-profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update localStorage with new name
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.name = nameInput;
      localStorage.setItem('user', JSON.stringify(currentUser));

      setUser(prev => prev ? {...prev, name: nameInput} : null);
      setEditMode(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordError(null);
      
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
        setPasswordError('All fields are required');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(buildApiUrl('api/users/update-password'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      // Reset form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setPasswordSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordSection(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const getPlanDisplay = () => {
    if (!user) return 'Unknown';

    switch (user.subscription?.plan) {
      case 'free':
        return 'Free Plan';
      case 'individual':
        return 'Individual Plan';
      case 'business':
        return 'Business Plan';
      case 'organization':
        return 'Organization Plan';
      default:
        return 'Unknown Plan';
    }
  };

  const getStatusDisplay = () => {
    if (!user) return 'Unknown';

    const status = user.subscription?.status;
    
    switch (status) {
      case 'active':
        return <span className="text-green-600 font-medium">Active</span>;
      case 'expired':
        return <span className="text-red-600 font-medium">Expired</span>;
      case 'canceled':
        return <span className="text-yellow-600 font-medium">Canceled</span>;
      case 'trialing':
        return <span className="text-blue-600 font-medium">Trial</span>;
      default:
        return <span className="text-gray-600 font-medium">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-100">
        <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-500">Leepi AI</h1>
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="hidden md:block md:w-64">
          <Sidebar 
            brandsData={brands}
            brandsLoading={brandsLoading}
            brandsError={brandsError} 
            source="scriptGroup"
            refreshTrigger={sidebarRefreshTrigger}
          />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Mobile Header */}
      <div className="md:hidden bg-white text-black p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-500">Leepi AI</h1>
        <button 
          onClick={() => setShowMobileSidebar(prev => !prev)} 
          className="text-black focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Sidebar - Conditionally shown on mobile */}
      <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:relative md:z-0 md:w-64`}>
        {showMobileSidebar && (
          <div 
            className="absolute inset-0 bg-black opacity-50 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
        )}
        <div className="relative h-full rounded-2xl border border-gray-300 overflow-hidden z-10 mt-2 mb-2 ml-2">
          <Sidebar 
            brandsData={brands}
            brandsLoading={brandsLoading}
            brandsError={brandsError}
            onCloseMobile={() => setShowMobileSidebar(false)}
            source="scriptGroup"
            refreshTrigger={sidebarRefreshTrigger}
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Regular header - Hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="mr-2 h-7 w-7 text-purple-600" />
                Account Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your personal information and account preferences</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  Personal Information
                </h2>
              </div>
              
              <div className="p-5">
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <p className="text-green-700">Profile updated successfully!</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Name field */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      {editMode ? (
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.name}</p>
                      )}
                    </div>
                    
                    <div>
                      {editMode ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setNameInput(user?.name || '');
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateProfile}
                            className="flex items-center p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Email field */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Account created date */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subscription Information Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-gray-500" />
                  Subscription Information
                </h2>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  {/* Current Plan */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                      <p className="text-gray-900 font-semibold">{getPlanDisplay()}</p>
                    </div>
                    
                    {user?.subscription?.plan === 'free' && (
                      <button
                        onClick={() => navigate('/subscription')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
                      >
                        Upgrade
                      </button>
                    )}
                    
                    {user?.subscription?.plan !== 'free' && user?.subscription?.status === 'expired' && (
                      <button
                        onClick={() => navigate('/subscription')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
                      >
                        Renew
                      </button>
                    )}
                  </div>
                  
                  {/* Subscription Status */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    {getStatusDisplay()}
                  </div>
                  
                  {/* Start Date */}
                  {user?.subscription?.startDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                      <p className="text-gray-900">{formatDate(user.subscription.startDate)}</p>
                    </div>
                  )}
                  
                  {/* Expiry Date */}
                  {user?.subscription?.expiresAt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                      <p className="text-gray-900">{formatDate(user.subscription.expiresAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Usage Statistics Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  Usage Statistics
                </h2>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Scripts Generated */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Scripts Generated</h3>
                    <div className="flex items-end mt-1">
                      <p className="text-2xl font-bold text-gray-900">{user?.usage?.scriptsGenerated || 0}</p>
                    </div>
                  </div>
                  
                  {/* Scripts Generated This Month */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Scripts This Month</h3>
                    <div className="flex items-end mt-1">
                      <p className="text-2xl font-bold text-gray-900">{user?.usage?.scriptsGeneratedThisMonth || 0}</p>
                      {user?.subscription?.plan === 'free' && (
                        <p className="ml-2 text-sm text-gray-500 self-end">/ 5</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Total Storyboards Generated */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Storyboards Generated</h3>
                    <div className="flex items-end mt-1">
                      <p className="text-2xl font-bold text-gray-900">{user?.usage?.storyboardsGenerated || 0}</p>
                    </div>
                  </div>
                  
                  {/* Last Usage Reset Date */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Last Reset Date</h3>
                    <p className="text-gray-900 mt-1">{formatDate(user?.usage?.lastResetDate)}</p>
                    <p className="text-xs text-gray-500 mt-1">Monthly counters reset automatically</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security Settings Card - Only show for email/password users */}
            {(!user?.authProvider || user.authProvider === 'local') && (
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                     onClick={() => setShowPasswordSection(!showPasswordSection)}>
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Security Settings
                  </h2>
                  {showPasswordSection ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </div>
                
                {showPasswordSection && (
                  <div className="p-5">
                    {passwordSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <p className="text-green-700">Password updated successfully!</p>
                      </div>
                    )}
                    
                    {passwordError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-600">{passwordError}</p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={handleUpdatePassword}
                          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* For Google or other social sign-in users, show info message instead */}
            {user?.authProvider && user.authProvider !== 'local' && (
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Security Settings
                  </h2>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <svg className="w-6 h-6 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor" />
                    </svg>
                    <div>
                      <p className="text-blue-700 font-medium">You're signed in with {user.authProvider === 'google' ? 'Google' : 'a social account'}</p>
                      <p className="text-blue-600 text-sm mt-1">Password management is handled by your {user.authProvider === 'google' ? 'Google' : 'social provider'} account.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Account Actions Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <LogOut className="w-5 h-5 mr-2 text-gray-500" />
                  Account Actions
                </h2>
              </div>
              
              <div className="p-5">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;