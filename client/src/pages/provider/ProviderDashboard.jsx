import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx
import api from '../../config/api';

function ProviderDashboard() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch provider's listings
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/providers/me/listings');
        setListings(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Provide more specific error messages
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 401) {
            setError('Authentication failed. Please log in as a service provider.');
          } else if (error.response.status === 403) {
            setError('Access denied. You must be a service provider to view this data.');
          } else {
            setError(error.response.data?.message || 'Failed to load your listings. Please try again later.');
          }
        } else if (error.request) {
          // Request was made but no response received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('Failed to load your listings. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      setIsStatsLoading(true);
      try {
        // Get booking stats
        const bookingsResponse = await api.get('/api/bookings/provider');

        const bookings = bookingsResponse.data.data || [];

        // Calculate stats from bookings
        const stats = {
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.bookingStatus === 'Pending').length,
          confirmedBookings: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
          completedBookings: bookings.filter(b => b.bookingStatus === 'Completed').length,
          totalEarnings: bookings
            .filter(b => b.bookingStatus === 'Completed')
            .reduce((sum, booking) => sum + (booking.providerEarning || booking.totalAmount || 0), 0)
        };

        setDashboardStats(stats);

        // Get recent bookings (last 5)
        const recentBookings = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentBookings(recentBookings);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchListings();
    fetchDashboardStats();
  }, [user, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
          return 'bg-blue-100 text-blue-800';
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening with your services today.</p>
        </div>
        <Link 
          to="/provider/services/new" 
          className="inline-flex items-center justify-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <i className="fas fa-plus mr-1.5"></i> Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <i className="fas fa-calendar-check text-white text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        dashboardStats.totalBookings
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        dashboardStats.pendingBookings
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        dashboardStats.confirmedBookings
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <i className="fas fa-check-double text-white text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        dashboardStats.completedBookings
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <i className="fas fa-rupee-sign text-white text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Earnings</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {isStatsLoading ? (
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        `₹${dashboardStats.totalEarnings.toLocaleString()}`
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          </div>
          {isStatsLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-calendar-times text-gray-300 text-3xl mb-3"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No recent bookings</h3>
              <p className="text-gray-500">You don't have any recent bookings yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <li key={booking._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {booking.customerId?.profilePicture ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={booking.customerId.profilePicture} alt={booking.customerId.firstName} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-user text-gray-400"></i>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerId?.firstName} {booking.customerId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.serviceListingId?.serviceTitle || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(booking.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className="mt-1 flex items-center">
                        <StatusBadge status={booking.bookingStatus} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Your Services */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Your Services</h2>
            <Link 
              to="/provider/services" 
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-list-alt text-gray-300 text-3xl mb-3"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
              <p className="text-gray-500 mb-4">You haven't created any services yet.</p>
              <Link 
                to="/provider/services/new" 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <i className="fas fa-plus mr-1.5"></i> Add Your First Service
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {listings.slice(0, 4).map((service) => (
                <li key={service._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {service.serviceImage ? (
                        <img className="h-16 w-16 rounded-md object-cover" src={service.serviceImage} alt={service.serviceTitle} />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-image text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.serviceTitle}</div>
                          <div className="text-sm text-gray-500">{service.categoryId?.categoryName || 'N/A'}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">₹{service.servicePrice?.toLocaleString() || '0'}</div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <StatusBadge status={service.isActive ? 'active' : 'inactive'} />
                        <span className="ml-2 text-sm text-gray-500">
                          {service.bookingCount || 0} bookings
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;