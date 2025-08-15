import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, ChevronDown, Home, LogOut, Menu, X } from "lucide-react";

interface User {
  id?: string;
  name?: string;
  email?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface HeaderProps {
  user: User | null;
  getUserFirstName: () => string;
  handleLogout: () => void;
}

export default function Header({ user, getUserFirstName, handleLogout }: HeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  return (
    <header className="relative z-[9999] bg-white ">
        <div
        className="absolute -inset-4 rounded-lg opacity-80 backdrop-blur  px-12 py-1 "
        style={{
          background:
            'linear-gradient(to right, #E1E7FB 0%, #F8EBEF 100%, #FAF3ED 100%)',
          filter: 'blur(30px)',
        }}
      ></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className=" relative flex items-center group">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 animate-liquid-flow"
            >
              Leepi AI
            </Link>
            
          </div>

          {/* Desktop Menu */}
          <nav className="relative font-bold hidden md:flex items-center space-x-2">
            <NavLinks />
          </nav>

          {/* Desktop Auth Buttons */}
          <div className=" relative hidden md:flex items-center space-x-4">
            {user  ? (
              <UserDropdown
                user={user}
                getUserFirstName={getUserFirstName}
                handleLogout={handleLogout}
                navigate={navigate}
                dropdownRef={dropdownRef}
                isUserDropdownOpen={isUserDropdownOpen}
                setIsUserDropdownOpen={setIsUserDropdownOpen}
              />
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="focus:outline-none relative"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="relative text-xs sm:text-sm md:text-lg lg:text-xl font-bold md:hidden bg-white shadow-lg px-4 pb-4 space-y-4">
          <NavlinkMobile />
          {user ? (
            <UserDropdownMobile
              user={user}
              getUserFirstName={getUserFirstName}
              handleLogout={handleLogout}
              navigate={navigate}
            />
          ) : (
            <AuthButtons />
          )}
        </div>
      )}
    </header>
  );
}

/* Navigation Links */
function NavLinks() {
  return (
    <>
      <LinkItem to="/" label="Home" hoverColor="pink-600" />
      <LinkItem to="/pricing" label="Pricing" hoverColor="purple-600" />
      <LinkItem to="/contact" label="Contact Us" hoverColor="blue-600" />
      <LinkItem to="/about" label="About Us" hoverColor="pink-600" />
    </>
  );
}

function NavlinkMobile(){
  return (
    <div className="py-3 space-y-2 text-xs sm:text-sm md:text-lg lg:text-xl font-bold items-center text-center" >
      <LinkItem to="/" label="Home"  hoverColor="pink-600" />
      <LinkItem to="/pricing" label="Pricing" hoverColor="purple-600" />
      <LinkItem to="/contact" label="Contact Us" hoverColor="blue-600" />
      <LinkItem to="/about" label="About Us" hoverColor="pink-600" />
    </div>
  );

}

/* Reusable Nav Link */
interface LinkItemProps {
  to: string;
  label: string;
  hoverColor: string;
  text?: string;

}

function LinkItem({ to, label, hoverColor,text }: LinkItemProps) {
  return (
    <Link
      to={to}
      className={`nav-item text-gray-700 hover:text-${hoverColor} transition-all duration-300 relative group px-4 py-2 rounded-lg text-${text}`}
    >
      <span className="relative z-10">{label}</span>
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 group-hover:w-full group-hover:left-0 transition-all duration-500"></span>
    </Link>
  );
}

/* Desktop User Dropdown */
interface UserDropdownProps {
  user?: User | null;
  getUserFirstName: () => string;
  handleLogout: () => void;
  navigate: ReturnType<typeof useNavigate>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  isUserDropdownOpen: boolean;
  setIsUserDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function UserDropdown({
  getUserFirstName,
  handleLogout,
  navigate,
  dropdownRef,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
}: UserDropdownProps) {
  return (
    <div className="relative z-[10000]" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsUserDropdownOpen(!isUserDropdownOpen);
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 font-medium text-gray-700 relative z-[10001]"
      >
        <UserIcon className="w-5 h-5" />
        <span>{getUserFirstName()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isUserDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[10002]">
          <div className="py-2">
            <DropdownItem
              icon={<Home className="w-4 h-4 mr-2" />}
              label="Dashboard"
              onClick={() => navigate("/dashboard")}
            />
            <DropdownItem
              icon={<LogOut className="w-4 h-4 mr-2" />}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* Mobile User Dropdown */
interface UserDropdownMobileProps {
  user?: User | null;
  getUserFirstName: () => string;
  handleLogout: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

function UserDropdownMobile({
  getUserFirstName,
  handleLogout,
  navigate,
}: UserDropdownMobileProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="font-semibold text-gray-700">{getUserFirstName()}</p>
      <div className="mt-2 space-y-2">
        <button
          className="flex items-center text-gray-700 hover:bg-gray-100 w-full px-3 py-2 rounded-md"
          onClick={() => navigate("/dashboard")}
        >
          <Home className="w-4 h-4 mr-2" /> Dashboard
        </button>
        <button
          className="flex items-center text-gray-700 hover:bg-gray-100 w-full px-3 py-2 rounded-md"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
      </div>
    </div>
  );
}

/* Dropdown Item */
interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function DropdownItem({ icon, label, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

/* Auth Buttons */
function AuthButtons() {
  return (
    <>
      <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium px-4 py-2 rounded-lg">
        Login
      </Link>
      <Link
        to="/signup"
        className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 transform font-medium"
      >
        Sign Up
      </Link>
    </>
  );
}
