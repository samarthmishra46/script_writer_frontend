import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import { User, shouldRedirectToSubscription } from '../utils/userTypes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setUser(parsedUser);
          } catch {
            console.warn('Failed to parse stored user, clearing.');
            localStorage.removeItem('user');
          }
        }

        const response = await fetch(buildApiUrl('api/auth/me'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const freshUser: User = await response.json();
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
      } catch (error) {
        console.error('Auth guard failed to refresh user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    loadUser();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const subscriptionPaths = ['/subscription', '/subscription/callback'];
  const isSubscriptionFlow = subscriptionPaths.some(path => location.pathname.startsWith(path));

  if (!isSubscriptionFlow && shouldRedirectToSubscription(user)) {
    return <Navigate to="/subscription" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
