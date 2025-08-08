import React, { useState } from 'react';
import { Link, useNavigate ,useLocation} from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Settings } from 'lucide-react'; // Import Settings icon

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  

  const currentPage = location.pathname.substring(1);
  let capitalizeFirst = currentPage.charAt(0).toUpperCase() + currentPage.slice(1); 
  if(capitalizeFirst!=='Dashboard' && capitalizeFirst!=='Settings'){
    capitalizeFirst="";}
// "My-profile-page"

  

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo for larger screens */}
            <h1 className="text-lg md:text-xl font-bold text-gray-900">{capitalizeFirst}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/subscription" 
              className="text-sm text-gray-600 hover:text-gray-900 hidden md:block"
            >
              Book a
            </Link>
            
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;