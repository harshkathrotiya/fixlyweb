import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../../components/admin/shared/Breadcrumbs';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if sidebar was collapsed in previous session
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const isActive = (path) => {
    // Special case for dashboard - exact match only
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    // For other paths, check if current path starts with the nav path
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // Mobile: toggle mobile menu
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // Desktop: toggle sidebar collapse
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);



  // Removed the useEffect hook that checked for Font Awesome loading

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        
        {/* Sidebar Header */}
        <div className={`bg-white py-4 transition-all duration-200 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
          <Link to="/admin" className="block">
            <h2 className={`text-xl font-bold tracking-tight transition-all duration-200 text-purple-600 ${sidebarCollapsed ? 'lg:text-center lg:text-sm' : ''}`}>
              {sidebarCollapsed ? 'F' : 'Fixly Admin'}
            </h2>
          </Link>
          
          {/* User Info */}
          <div className={`mt-4 flex items-center p-3 bg-purple-50 rounded-lg transition-all duration-200 ${sidebarCollapsed ? 'lg:flex-col lg:p-2' : ''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mr-3 lg:mr-0 flex items-center justify-center bg-gray-200">
              {user?.profilePicture ? (
                <>
                  <img
                    src={user.profilePicture}
                    alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Admin'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                    <i className="fas fa-user text-sm text-purple-600"></i>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <i className="fas fa-user text-sm text-purple-600"></i>
                </div>
              )}
            </div>
            <div className={`${sidebarCollapsed ? 'lg:hidden' : ''} lg:ml-3`}>
              <h3 className="text-sm font-semibold text-gray-900">
                {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Admin'}
              </h3>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { path: '/admin', icon: 'tachometer-alt', label: 'Dashboard' },
            { path: '/admin/users', icon: 'users', label: 'Users' },
            { path: '/admin/providers', icon: 'user-tie', label: 'Service Providers' },
            { path: '/admin/listings', icon: 'list', label: 'Listings' },
            { path: '/admin/services', icon: 'concierge-bell', label: 'Services' },
            { path: '/admin/bookings', icon: 'calendar-check', label: 'Bookings' },
            { path: '/admin/categories', icon: 'tags', label: 'Categories' },
            { path: '/admin/commissions', icon: 'percentage', label: 'Commissions' },
            { path: '/admin/complaints', icon: 'exclamation-circle', label: 'Complaints' },
            { path: '/admin/reports', icon: 'chart-bar', label: 'Reports' },
            { path: '/admin/settings', icon: 'cog', label: 'Settings' }
          ].map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''} ${
                  active
                    ? 'text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full" />
                )}
                <i className={`fas fa-${item.icon} text-sm ${sidebarCollapsed ? 'lg:mr-0' : 'mr-3'} ${active ? 'text-purple-700' : 'text-gray-400'}`} />
                <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-all duration-200 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`py-4 border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-6'} transition-all duration-200`}>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-200 hover:-translate-y-0.5 ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <i className={`fas fa-sign-out-alt text-sm ${sidebarCollapsed ? 'lg:mr-0' : 'mr-2'}`} />
            <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} transition-all duration-200 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <i className="fas fa-bars text-lg" />
            </button>
            
            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <i className="fas fa-bars text-lg" />
            </button>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <i className="far fa-bell text-lg" />
                <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative user-dropdown-container">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {user?.profilePicture ? (
                      <>
                        <img
                          src={user.profilePicture}
                          alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Admin'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                          <i className="fas fa-user text-xs text-purple-600"></i>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <i className="fas fa-user text-xs text-purple-600"></i>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Admin'}
                  </span>
                  <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'} text-xs text-gray-500`} />
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="fas fa-user-circle mr-2 text-purple-600"></i>
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="fas fa-sign-out-alt mr-2 text-red-500"></i>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
