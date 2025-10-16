import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
// Remove AdminLayout import since it will be handled by App.jsx
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterIsActive, setFilterIsActive] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const { user } = useAuth();

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Function to fetch providers with filters, search, sorting, and pagination
  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;
      
      // Add sorting parameters
      // Map the sort key to the correct field
      const sortKeyMapping = {
        'userId.firstName': 'firstName',
        'userId.email': 'email',
        'userId.phone': 'phone',
        'userId.isActive': 'isActive',
        'verificationStatus': 'verificationStatus',
        'createdAt': 'createdAt'
      };
      
      const actualSortKey = sortKeyMapping[sortConfig.key] || sortConfig.key;
      queryParams += `&sort=${actualSortKey}&order=${sortConfig.direction}`;

      if (filterVerification !== 'all') {
        queryParams += `&verificationStatus=${filterVerification}`;
      }

      if (filterIsActive !== 'all') {
        queryParams += `&isActive=${filterIsActive}`;
      }

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log('Fetching providers with params:', queryParams);
      // Use the api instance that automatically handles authentication
      const response = await api.get(`/api/providers?${queryParams}`);

      console.log('Fetched providers:', response.data);
      setProviders(response.data.data || []);
      
      // Handle both pagination structures (nested and flat)
      const paginationData = response.data.pagination || response.data;
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        pages: paginationData.pages || Math.ceil((paginationData.total || 0) / prev.limit)
      }));
    } catch (err) {
      console.error('Error fetching providers:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as an admin user.');
          toast.error('Authentication failed. Please log in as an admin user.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be an administrator to view this data.');
          toast.error('Access denied. You must be an administrator to view this data.');
        } else {
          const errorMessage = err.response.data?.message || 'Failed to load service providers. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to load service providers. Please try again.');
        toast.error('Failed to load service providers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    // Map UI column keys to actual data keys
    const keyMapping = {
      'firstName': 'userId.firstName',
      'email': 'userId.email',
      'phone': 'userId.phone',
      'isActive': 'userId.isActive'
    };
    
    const actualKey = keyMapping[key] || key;
    
    setSortConfig(prevConfig => ({
      key: actualKey,
      direction: prevConfig.key === actualKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Call fetchProviders when dependencies change
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, sortConfig.key, sortConfig.direction, filterVerification, filterIsActive, searchTerm]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle search input
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProviders();
  };

  // Handle verification status toggle
  const handleToggleVerification = async (provider) => {
    try {
      const toastId = toast.loading(`${provider.verificationStatus === 'Verified' ? 'Rejecting' : 'Verifying'} provider...`);

      const newStatus = provider.verificationStatus === 'Verified' ? 'Rejected' : 'Verified';

      const response = await api.put(
        `/api/admin/providers/${provider._id}/verify`,
        { verificationStatus: newStatus }
      );

      setProviders(providers.map(p =>
        p._id === provider._id ? response.data.data : p
      ));

      toast.update(toastId, {
        render: `Provider ${newStatus === 'Verified' ? 'verified' : 'rejected'} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setTimeout(() => fetchProviders(), 100);
    } catch (err) {
      console.error('Error toggling provider verification:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update provider verification status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (provider) => {
    setProviderToDelete(provider);
    setShowDeleteDialog(true);
  };

  // Handle delete provider
  const handleDeleteProvider = async () => {
    if (!providerToDelete) return;

    // Since there's no DELETE endpoint implemented in the backend,
    // we'll show a message to the admin user
    toast.error('Delete functionality is not implemented in the backend. Please reject the provider instead.');
    
    // Close the dialog
    setShowDeleteDialog(false);
    setProviderToDelete(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Badge component
  const Badge = ({ type, text, icon }) => {
    const getBadgeStyles = () => {
      switch (type) {
        case 'verified':
        case 'active':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'rejected':
        case 'inactive':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
        {icon && <i className={`fas ${icon} mr-1`}></i>}
        {text}
      </span>
    );
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    const keyMapping = {
      'firstName': 'userId.firstName',
      'email': 'userId.email',
      'phone': 'userId.phone',
      'isActive': 'userId.isActive'
    };
    
    const actualKey = keyMapping[columnKey] || columnKey;
    
    if (sortConfig.key === actualKey) {
      return (
        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
      );
    }
    return <i className="fas fa-sort ml-1"></i>;
  };

  // Quick view modal
  const QuickViewModal = () => {
    if (!selectedProvider) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowQuickView(false)}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Provider Details</h3>
            <button
              onClick={() => setShowQuickView(false)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0">
                {selectedProvider.userId?.profilePicture ? (
                  <>
                    <img 
                      className="h-16 w-16 rounded-full object-cover" 
                      src={selectedProvider.userId.profilePicture} 
                      alt={selectedProvider.userId.firstName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                      <i className="fas fa-user text-xl"></i>
                    </div>
                  </>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <i className="fas fa-user text-xl"></i>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {selectedProvider.userId?.firstName} {selectedProvider.userId?.lastName}
                </h4>
                <p className="text-gray-600">{selectedProvider.userId?.email}</p>
                <div className="flex items-center mt-1">
                  <Badge 
                    type={selectedProvider.verificationStatus?.toLowerCase() || 'pending'} 
                    text={selectedProvider.verificationStatus || 'Pending'} 
                  />
                  <span className="mx-2">•</span>
                  <Badge 
                    type={selectedProvider.userId?.isActive ? 'active' : 'inactive'} 
                    text={selectedProvider.userId?.isActive ? 'Active' : 'Inactive'} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProvider.userId?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProvider.userId?.businessName || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProvider.verificationStatus || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProvider.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Category</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedProvider.serviceCategory && selectedProvider.serviceCategory.length > 0
                    ? selectedProvider.serviceCategory.map(cat => cat.categoryName).join(', ')
                    : 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Commission Rate</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProvider.commissionRate || 0}%</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Service Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedProvider.serviceDescription || 'N/A'}</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Business Address</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedProvider.userId?.address 
                  ? `${selectedProvider.userId.address.street || ''}, ${selectedProvider.userId.address.city || ''}, ${selectedProvider.userId.address.state || ''} ${selectedProvider.userId.address.zipCode || ''}`
                  : 'N/A'}
              </p>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedProvider.userId?.description || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-800">Listings</p>
                <p className="text-lg font-bold text-purple-900">{selectedProvider.listingCount || 0}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-800">Bookings</p>
                <p className="text-lg font-bold text-purple-900">{selectedProvider.bookingCount || 0}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-800">Reviews</p>
                <p className="text-lg font-bold text-purple-900">{selectedProvider.reviewCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    // Remove AdminLayout wrapper since it's handled by App.jsx
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all service providers in the system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge type="verified" text={`${providers.filter(p => p.verificationStatus === 'Verified').length} Verified`} />
          <Badge type="pending" text={`${providers.filter(p => p.verificationStatus === 'Pending').length} Pending`} />
          <Badge type="rejected" text={`${providers.filter(p => p.verificationStatus === 'Rejected').length} Rejected`} />
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md bg-green-50 p-4 border border-green-200"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => {
                      setSearchTerm('');
                      setPagination(prev => ({ ...prev, page: 1 }));
                      setTimeout(() => fetchProviders(), 100);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={filterVerification}
              onChange={(e) => {
                setFilterVerification(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Verification Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <select
              value={filterIsActive}
              onChange={(e) => {
                setFilterIsActive(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center">
                    Provider
                    <SortIndicator columnKey="firstName" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <SortIndicator columnKey="email" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center">
                    Phone
                    <SortIndicator columnKey="phone" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('verificationStatus')}
                >
                  <div className="flex items-center">
                    Verification
                    <SortIndicator columnKey="verificationStatus" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIndicator columnKey="isActive" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Joined
                    <SortIndicator columnKey="createdAt" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="loader"></div>
                    </div>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    <i className="fas fa-user-tie text-gray-300 text-3xl mb-2 block"></i>
                    No service providers found
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <motion.tr 
                    key={provider._id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {provider.userId?.profilePicture ? (
                            <>
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={provider.userId.profilePicture} 
                                alt={provider.userId.firstName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                <i className="fas fa-user text-sm"></i>
                              </div>
                            </>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <i className="fas fa-user text-sm"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.userId?.firstName} {provider.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.userId?.businessName || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {provider.userId?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {provider.userId?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        type={provider.verificationStatus?.toLowerCase() || 'pending'} 
                        text={provider.verificationStatus || 'Pending'} 
                        icon={provider.verificationStatus === 'Verified' ? 'fa-check-circle' : provider.verificationStatus === 'Rejected' ? 'fa-times-circle' : 'fa-clock'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        type={provider.userId?.isActive ? 'active' : 'inactive'} 
                        text={provider.userId?.isActive ? 'Active' : 'Inactive'} 
                        icon={provider.userId?.isActive ? 'fa-check-circle' : 'fa-times-circle'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(provider.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowQuickView(true);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <i className="fas fa-eye mr-1"></i> View
                        </button>
                        <button
                          onClick={() => handleToggleVerification(provider)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            provider.verificationStatus === 'Verified'
                              ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                              : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                          }`}
                        >
                          {provider.verificationStatus === 'Verified' ? 'Reject' : 'Verify'}
                        </button>
                        <button
                          onClick={() => showDeleteConfirmation(provider)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-400 cursor-not-allowed"
                          title="Delete functionality not implemented"
                          disabled
                        >
                          <i className="fas fa-trash mr-1"></i> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && providers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  pagination.page === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  pagination.page === pagination.pages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      pagination.page === 1 ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <i className="fas fa-chevron-left h-5 w-5"></i>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.pages).keys()].map((number) => {
                    const pageNumber = number + 1;
                    // Show current page, first, last, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.pages ||
                      (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          aria-current={pagination.page === pageNumber ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pagination.page === pageNumber
                              ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      pagination.page === pagination.pages ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <i className="fas fa-chevron-right h-5 w-5"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          >
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Delete functionality is not implemented in the backend. 
                    To remove a provider, please use the "Reject" button instead to change their verification status.
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && <QuickViewModal />}
      </AnimatePresence>
    </div>
    // Remove AdminLayout wrapper since it's handled by App.jsx
  );
}

export default Providers;