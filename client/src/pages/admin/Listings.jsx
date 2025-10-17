import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Import local placeholder image
import PlaceholderImg from '../../assets/plumbing.png';

function Listings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete'
  const [sortConfig, setSortConfig] = useState({ key: 'serviceTitle', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, [pagination.page, sortConfig, filterCategory, filterStatus]);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}&admin=true`;

      if (filterCategory !== 'all') {
        queryParams += `&category=${filterCategory}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus === 'active' ? 'true' : 'false'}`;
      }

      // Use the api instance that automatically handles authentication
      const response = await api.get(`/api/listings?${queryParams}`);

      setListings(response.data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || response.data.total || 0,
        pages: response.data.pagination?.pages || Math.ceil((response.data.total || 0) / pagination.limit)
      }));
    } catch (err) {
      console.error('Error fetching listings:', err);
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
          const errorMessage = err.response.data?.message || 'Failed to load service listings. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to load service listings. Please try again.');
        toast.error('Failed to load service listings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the api instance that automatically handles authentication
      const response = await api.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle view listing details
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalMode('view');
    setIsModalOpen(true);
  };



  // Handle toggle listing status
  const handleToggleStatus = async (listing) => {
    try {
      // Use the admin-specific endpoint for updating listing status
      await api.put(`/api/admin/listings/${listing._id}/status`, {
        isActive: !listing.isActive
      });

      // Update local state
      setListings(listings.map(item =>
        item._id === listing._id
          ? { ...item, isActive: !item.isActive }
          : item
      ));

      // Show success message
      toast.success(`Listing ${!listing.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status. Please try again.');
      toast.error('Failed to update listing status');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    // Ensure amount is a number
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
      return '₹0.00';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(numericAmount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Badge component for status
  const StatusBadge = ({ isActive }) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          isActive ? 'bg-purple-400' : 'bg-red-400'
        }`}></span>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Pagination component
  const Pagination = ({ pagination, onPageChange }) => {
    const { page, pages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (pages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left h-5 w-5"></i>
            </button>
            
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  pageNum === page
                    ? 'z-10 bg-purple-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                } transition-colors duration-200`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right h-5 w-5"></i>
            </button>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Listings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all service listings in the system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                setSortConfig({ key: 'serviceTitle', direction: 'asc' });
                setPagination(prev => ({ ...prev, page: 1 }));
                fetchListings();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Reset
            </button>
            <button
              onClick={fetchListings}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
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
      )}

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            All Listings
            {listings.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('serviceTitle')}
                >
                  <div className="flex items-center">
                    Service
                    {sortConfig.key === 'serviceTitle' && (
                      <span className="ml-1 text-purple-600">
                        {sortConfig.direction === 'asc' ? (
                          <i className="fas fa-chevron-up"></i>
                        ) : (
                          <i className="fas fa-chevron-down"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortConfig.key === 'price' && (
                      <span className="ml-1 text-purple-600">
                        {sortConfig.direction === 'asc' ? (
                          <i className="fas fa-chevron-up"></i>
                        ) : (
                          <i className="fas fa-chevron-down"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'isActive' && (
                      <span className="ml-1 text-purple-600">
                        {sortConfig.direction === 'asc' ? (
                          <i className="fas fa-chevron-up"></i>
                        ) : (
                          <i className="fas fa-chevron-down"></i>
                        )}
                      </span>
                    )}
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
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="loader"></div>
                    </div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-inbox text-3xl text-gray-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No listings found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-200">
                          {listing.serviceImage ? (
                            <img className="h-10 w-10" src={listing.serviceImage} alt={listing.serviceTitle} />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <i className="fas fa-image text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{listing.serviceTitle}</div>
                          <div className="text-sm text-gray-500">ID: {listing._id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.categoryId?.categoryName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.serviceProviderId?.userId?.firstName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(listing.price || listing.servicePrice || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={listing.isActive} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewListing(listing)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <i className="fas fa-eye mr-1 text-purple-600"></i> View
                        </button>
                        <button
                          onClick={() => handleToggleStatus(listing)}
                          className={`inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            listing.isActive 
                              ? 'text-red-700 bg-white hover:bg-red-50 focus:ring-red-500' 
                              : 'text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                          }`}
                        >
                          <i className={`fas fa-${listing.isActive ? 'times' : 'check'} mr-1 ${listing.isActive ? 'text-red-600' : 'text-green-600'}`}></i>
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && listings.length > 0 && (
          <Pagination 
            pagination={pagination} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>

      {/* Listing Modal */}
      <AnimatePresence>
        {isModalOpen && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Listing Details
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                {modalMode === 'view' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Listing Header with ID and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500">Listing ID</div>
                        <div className="text-sm font-medium text-gray-900">{selectedListing._id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div>
                          <StatusBadge isActive={selectedListing.isActive} />
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        <i className="fas fa-concierge-bell mr-2"></i> Service Details
                      </h3>
                      <div className="flex items-center mb-4">
                        <div className="service-image-detail-container">
                          {selectedListing.serviceImage ? (
                            <>
                              <img
                                src={selectedListing.serviceImage}
                                alt={selectedListing.serviceTitle || 'Service'}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                <i className="fas fa-image text-2xl"></i>
                              </div>
                            </>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                              <i className="fas fa-image text-2xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold text-gray-900">{selectedListing.serviceTitle || 'N/A'}</h4>
                          {selectedListing.categoryId && (
                            <div className="text-sm text-gray-600">
                              <i className="fas fa-tag mr-1"></i>
                              {selectedListing.categoryId.categoryName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="text-purple-600 font-semibold">
                            {formatCurrency(selectedListing.price || selectedListing.servicePrice || 0)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-500">Duration</div>
                          <div>
                            {selectedListing.duration || 'N/A'} minutes
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provider Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        <i className="fas fa-user-tie mr-2"></i> Provider Information
                      </h3>
                      <div className="flex items-center mb-4">
                        <div className="user-detail-image-container">
                          {selectedListing.serviceProviderId?.userId?.profilePicture ? (
                            <>
                              <img
                                className="w-12 h-12 rounded-full object-cover"
                                src={selectedListing.serviceProviderId.userId.profilePicture}
                                alt={`${selectedListing.serviceProviderId.userId.firstName || 'Provider'}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                <i className="fas fa-user text-lg"></i>
                              </div>
                            </>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <i className="fas fa-user text-lg"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedListing.serviceProviderId?.userId?.firstName || 'N/A'} {selectedListing.serviceProviderId?.userId?.lastName || ''}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-500">Email</div>
                          <div className="text-sm">{selectedListing.serviceProviderId?.userId?.email || 'N/A'}</div>
                        </div>
                        {selectedListing.serviceProviderId?.userId?.phone && (
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="text-sm">{selectedListing.serviceProviderId.userId.phone}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {selectedListing.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          <i className="fas fa-info-circle mr-2"></i> Description
                        </h3>
                        <div className="bg-white rounded-lg p-3">
                          {selectedListing.description}
                        </div>
                      </div>
                    )}

                    {/* Modal Footer */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}


              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Listings;