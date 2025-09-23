import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  // Get auth context directly
  const { user, logout, isAuthenticated: authIsAuthenticated } = useAuth();

  // Check authentication on mount and when auth changes
  useEffect(() => {
    // Set authentication state from context
    setIsAuthenticated(authIsAuthenticated());

    // Set user type from context if user exists
    if (user) {
      const userTypeValue = user.userType || (user.data && user.data.userType);
      setUserType(userTypeValue);
    } else {
      setUserType(null);
    }

    // Set up event listeners for auth changes
    const handleAuthChange = () => {
      setIsAuthenticated(authIsAuthenticated());
      if (user) {
        const userTypeValue = user.userType || (user.data && user.data.userType);
        setUserType(userTypeValue);
      } else {
        setUserType(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);

    // Clean up
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [user, authIsAuthenticated, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');

    if (logout) {
      logout();
    }

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('auth-change'));
    setIsAuthenticated(false);
    setUserType(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-[#babfbc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-[#50B498] to-[#468585] bg-clip-text text-transparent">
              Fixly
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${location.pathname === '/' ? 'text-[#50B498] font-semibold' : 'text-[#727373] hover:text-[#50B498]'}`}>
              Home
            </Link>
            <Link to="/services" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${location.pathname === '/services' ? 'text-[#50B498] font-semibold' : 'text-[#727373] hover:text-[#50B498]'}`}>
              Services
            </Link>
            <Link to="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${location.pathname === '/about' ? 'text-[#50B498] font-semibold' : 'text-[#727373] hover:text-[#50B498]'}`}>
              About
            </Link>
            <Link to="/contact" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${location.pathname === '/contact' ? 'text-[#50B498] font-semibold' : 'text-[#727373] hover:text-[#50B498]'}`}>
              Contact
            </Link>
            {isAuthenticated && (
              <Link to="/bookings" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-300 ${location.pathname === '/bookings' ? 'text-[#50B498] font-semibold' : 'text-[#727373] hover:text-[#50B498]'}`}>
                <i className="fas fa-calendar-alt mr-1"></i> My Bookings
              </Link>
            )}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {userType === 'service_provider' ? (
                  <Link to="/provider/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md">
                    Dashboard
                  </Link>
                ) : userType === 'admin' ? (
                  <Link to="/admin" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md">
                    Admin Dashboard
                  </Link>
                ) : userType === 'user' ? (
                  <Link to="/profile" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md">
                    My Profile
                  </Link>
                ) : null}
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 text-sm font-medium text-[#0b0e11] bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] rounded-md hover:from-[#9CDBA6] hover:to-[#50B498] transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#0b0e11] hover:text-[#50B498] transition-colors duration-300">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#727373] hover:text-[#45573a] focus:outline-none"
            >
              <i className={isMenuOpen ? "fas fa-times text-xl" : "fas fa-bars text-xl"}></i>
            </button>
          </div>
        </div>
      </div>

  {/* Mobile Menu */}
{isMenuOpen && (
  <div className="md:hidden bg-white border-t border-[#babfbc]">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      <Link 
        to="/" 
        className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'text-[#50B498] bg-[#ebf2f3] font-semibold' : 'text-[#0b0e11] hover:text-[#50B498] hover:bg-[#ebf2f3]'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        Home
      </Link>
      <Link 
        to="/services" 
        className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/services' ? 'text-[#50B498] bg-[#ebf2f3] font-semibold' : 'text-[#0b0e11] hover:text-[#50B498] hover:bg-[#ebf2f3]'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        Services
      </Link>
      <Link 
        to="/about" 
        className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/about' ? 'text-[#50B498] bg-[#ebf2f3] font-semibold' : 'text-[#0b0e11] hover:text-[#50B498] hover:bg-[#ebf2f3]'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        About
      </Link>
      <Link 
        to="/contact" 
        className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/contact' ? 'text-[#50B498] bg-[#ebf2f3] font-semibold' : 'text-[#0b0e11] hover:text-[#50B498] hover:bg-[#ebf2f3]'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        Contact
      </Link>
      {isAuthenticated && (
        <Link 
          to="/bookings" 
          className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/bookings' ? 'text-[#50B498] bg-[#ebf2f3] font-semibold' : 'text-[#0b0e11] hover:text-[#50B498] hover:bg-[#ebf2f3]'}`}
          onClick={() => setIsMenuOpen(false)}
        >
          <i className="fas fa-calendar-alt mr-2"></i> My Bookings
        </Link>
      )}
    </div>
    
    {/* Mobile Auth Buttons */}
    <div className="pt-4 pb-3 border-t border-[#babfbc]">
      <div className="flex flex-col space-y-3 px-4">
        {isAuthenticated ? (
          <>
            {userType === 'service_provider' ? (
              <Link 
                to="/provider/dashboard" 
                className="px-4 py-2 text-base font-medium text-white text-center bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : userType === 'admin' ? (
              <Link 
                to="/admin" 
                className="px-4 py-2 text-base font-medium text-white text-center bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            ) : userType === 'user' ? (
              <Link 
                to="/profile" 
                className="px-4 py-2 text-base font-medium text-white text-center bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </Link>
            ) : null}
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 text-base font-medium text-[#0b0e11] text-center bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] rounded-md hover:from-[#9CDBA6] hover:to-[#50B498] transition-colors duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 text-base font-medium text-center text-[#0b0e11] hover:text-[#50B498] transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 text-base font-medium text-white text-center bg-gradient-to-r from-[#50B498] to-[#468585] rounded-md hover:from-[#468585] hover:to-[#50B498] transition-all duration-300 shadow-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
)}
</nav>
);
}

export default Navbar;