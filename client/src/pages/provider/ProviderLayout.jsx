import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Remove the CSS import since we'll use Tailwind classes
// import './ProviderLayout.css';

function ProviderLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Call the logout function from AuthContext
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:transform-none`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <i className="fas fa-tools"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Fixly</h2>
            </Link>
            
            {/* Provider Info */}
            <div className="mt-6 flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-white shadow">
                  {user?.profilePicture ? (
                    <img
                      className="w-full h-full object-cover"
                      src={user.profilePicture}
                      alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Provider'}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-white shadow" style={{display: user?.profilePicture ? 'none' : 'flex'}}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Provider'}
                </h3>
                <p className="text-xs text-gray-500 truncate">Service Provider</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/provider/dashboard" 
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/provider/dashboard') 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-tachometer-alt mr-3"></i>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/provider/bookings" 
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/provider/bookings') 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-calendar-check mr-3"></i>
                  <span>Bookings</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/provider/services" 
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/provider/services') 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-list-alt mr-3"></i>
                  <span>My Services</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/provider/profile" 
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/provider/profile') 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-user-circle mr-3"></i>
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button 
              className="w-full flex items-center justify-center px-2.5 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              onClick={handleLogout} 
              disabled={isLoggingOut}
            >
              <i className="fas fa-sign-out-alt mr-1.5"></i>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              onClick={toggleSidebar}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <i className="far fa-bell text-lg"></i>
                <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      className="w-full h-full object-cover"
                      src={user.profilePicture}
                      alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Provider'}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: user?.profilePicture ? 'none' : 'flex'}}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Provider'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ProviderLayout;