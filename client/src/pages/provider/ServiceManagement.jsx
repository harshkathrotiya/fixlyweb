import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import ServiceCard from '../../components/common/ServiceCard';

function ServiceManagement() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(6); // 6 services per page
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the correct API endpoint for both development and production
        const response = await api.get('/api/providers/me/listings');
        console.log('Fetched services:', response.data);
        
        // Check if response has data property and it's an array
        if (response.data && Array.isArray(response.data.data)) {
          setServices(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where data is directly in response.data
          setServices(response.data);
        } else {
          // Handle empty or unexpected response
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        // Provide more specific error messages
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in as a service provider.');
          } else if (err.response.status === 403) {
            setError('Access denied. You must be a service provider to view this data.');
          } else {
            setError(err.response.data?.message || 'Failed to load services. Please try again.');
          }
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('Failed to load services. Please try again.');
        }
        // Set empty services array on error to prevent infinite loading
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleToggleActive = async (serviceId, currentStatus) => {
    console.log(`Toggling service ${serviceId} from ${currentStatus} to ${!currentStatus}`);
    try {
      const response = await api.put(`/api/listings/${serviceId}/status`, {
        isActive: !currentStatus
      });

      console.log('Toggle response:', response.data);

      // Update local state
      setServices(services.map(service =>
        service._id === serviceId
          ? { ...service, isActive: !currentStatus }
          : service
      ));
    } catch (err) {
      console.error('Error updating service status:', err);
      setError('Failed to update service status. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/api/listings/${serviceId}`);

      // Update local state
      setServices(services.filter(service => service._id !== serviceId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    }
  };

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Filter by active status
      if (filterActive === 'active') return service.isActive;
      if (filterActive === 'inactive') return !service.isActive;
      return true;
    })
    .filter(service => {
      // Filter by search term
      if (!searchTerm) return true;
      return service.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (service.serviceDetails && service.serviceDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (service.categoryId?.categoryName && service.categoryId.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => {
      // Sort services
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priceHigh') return (b.servicePrice || 0) - (a.servicePrice || 0);
      if (sortBy === 'priceLow') return (a.servicePrice || 0) - (b.servicePrice || 0);
      if (sortBy === 'nameAZ') return a.serviceTitle.localeCompare(b.serviceTitle);
      if (sortBy === 'nameZA') return b.serviceTitle.localeCompare(a.serviceTitle);
      if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0);
      return 0;
    });

  // Get current services for pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your service listings</p>
        </div>
        <Link 
          to="/provider/services/new" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i> Add New Service
        </Link>
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

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative rounded-md shadow-sm flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="all">All Services</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
              <option value="bookings">Most Bookings</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loader"></div>
        </div>
      ) : currentServices.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-list-alt text-gray-300 text-5xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterActive !== 'all' 
              ? "No services match your current filters." 
              : "You haven't created any services yet."}
          </p>
          <Link 
            to="/provider/services/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <i className="fas fa-plus mr-2"></i> Add Your First Service
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map((service) => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  onView={() => navigate(`/listing/${service._id}`)}
                  onEdit={() => navigate(`/provider/services/edit/${service._id}`)}
                  onToggleActive={() => handleToggleActive(service._id, service.isActive)}
                  onDelete={() => setConfirmDelete(service)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {service.serviceImage ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={service.serviceImage} alt={service.serviceTitle} />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <i className="fas fa-image text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{service.serviceTitle}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{service.serviceDetails}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.categoryId?.categoryName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{service.servicePrice?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge isActive={service.isActive} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.bookingCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/provider/services/edit/${service._id}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View/Edit"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => navigate(`/provider/services/edit/${service._id}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleToggleActive(service._id, service.isActive)}
                            className={`${
                              service.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                            }`}
                            title={service.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas ${service.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(service)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
                Confirm Delete
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{confirmDelete.serviceTitle}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteService(confirmDelete._id)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Service
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="mt-3 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
