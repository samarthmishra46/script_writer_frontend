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
    <header className={`bg-white border-b  ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo for larger screens */}
            <h1 className="text-lg md:text-xl font-bold text-gray-900">{capitalizeFirst}</h1>
          </div>
          
            <div className="flex items-center space-x-3">
            <Link
  to="/subscription"
  className="hidden md:inline-block rounded-full p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
>
  <span className="block rounded-full bg-white text-gray-700 font-semibold px-4 py-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors duration-200">
    Book A Shoot
  </span>
</Link>

            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;