import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10); // 10 bookings per page
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the correct API endpoint for both development and production
        const response = await api.get('/api/bookings/provider');
        setBookings(response.data.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        // Provide more specific error messages
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in as a service provider.');
          } else if (err.response.status === 403) {
            setError('Access denied. You must be a service provider to view this data.');
          } else {
            setError(err.response.data?.message || 'Failed to load bookings. Please try again.');
          }
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('Failed to load bookings. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    setStatusMessage({ type: '', message: '' });

    try {
      await api.put(`/api/bookings/${bookingId}/status`, {
        status: newStatus
      });

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, bookingStatus: newStatus }
          : booking
      ));

      setStatusMessage({
        type: 'success',
        message: `Booking status updated to ${newStatus} successfully!`
      });

      // Close modal if open
      if (isModalOpen && selectedBooking?._id === bookingId) {
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to update booking status. Please try again.'
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // Handle invalid dates
    if (!dateString || dateString === 'Invalid Date') {
      return 'N/A';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    // Handle invalid times
    if (!dateString || dateString === 'Invalid Date') {
      return 'N/A';
    }
    const options = { hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleTimeString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'pending') return booking.bookingStatus === 'Pending';
    if (activeTab === 'confirmed') return booking.bookingStatus === 'Confirmed';
    if (activeTab === 'completed') return booking.bookingStatus === 'Completed';
    if (activeTab === 'cancelled') return booking.bookingStatus === 'Cancelled';
    return true;
  });

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your service bookings</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Pending').length}</span>
              <span className="ml-1">Pending</span>
            </span>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Confirmed').length}</span>
              <span className="ml-1">Confirmed</span>
            </span>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Completed').length}</span>
              <span className="ml-1">Completed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage.type && (
        <div className={`rounded-md p-4 ${statusMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <i className={`fas ${statusMessage.type === 'success' ? 'fa-check-circle text-green-400' : 'fa-exclamation-circle text-red-400'}`}></i>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {statusMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending', count: bookings.filter(b => b.bookingStatus === 'Pending').length },
            { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.bookingStatus === 'Confirmed').length },
            { key: 'completed', label: 'Completed', count: bookings.filter(b => b.bookingStatus === 'Completed').length },
            { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.bookingStatus === 'Cancelled').length },
            { key: 'all', label: 'All Bookings', count: bookings.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="loader"></div>
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-calendar-check text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? "You don't have any bookings yet." 
                : `You don't have any ${activeTab} bookings.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                              {booking.customerId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.serviceListingId?.serviceTitle || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.serviceListingId?.categoryId?.categoryName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.bookingDateTime || booking.serviceDateTime)}</div>
                        <div className="text-sm text-gray-500">{formatTime(booking.bookingDateTime || booking.serviceDateTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(booking.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.bookingStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <i className="fas fa-eye mr-1"></i> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastBooking, filteredBookings.length)}</span> of{' '}
                      <span className="font-medium">{filteredBookings.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-12 w-12">
                          {selectedBooking.customerId?.profilePicture ? (
                            <img className="h-12 w-12 rounded-full object-cover" src={selectedBooking.customerId.profilePicture} alt={selectedBooking.customerId.firstName} />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-user text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedBooking.customerId?.firstName} {selectedBooking.customerId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedBooking.customerId?.email}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-phone-alt mr-2 text-gray-400"></i>
                          {selectedBooking.customerId?.phone || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                          {selectedBooking.customerId?.address || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Booking Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Service:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBooking.serviceListingId?.serviceTitle || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBooking.serviceListingId?.categoryId?.categoryName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Booking Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedBooking.bookingDateTime || selectedBooking.serviceDateTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Booking Time:</span>
                        <span className="text-sm font-medium text-gray-900">{formatTime(selectedBooking.bookingDateTime || selectedBooking.serviceDateTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBooking.duration || 'N/A'} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <span className="text-sm font-medium text-gray-900">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <StatusBadge status={selectedBooking.bookingStatus} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBooking.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBooking.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Customer Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {selectedBooking.customerNotes || 'No additional notes provided.'}
                    </p>
                  </div>
                </div>
                
                {/* Status Update */}
                {selectedBooking.bookingStatus !== 'Completed' && selectedBooking.bookingStatus !== 'Cancelled' && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Update Booking Status</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedBooking.bookingStatus === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'Confirmed')}
                          disabled={statusUpdateLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {statusUpdateLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check mr-2"></i> Confirm Booking
                            </>
                          )}
                        </button>
                      )}
                      {(selectedBooking.bookingStatus === 'Pending' || selectedBooking.bookingStatus === 'Confirmed') && (
                        <button
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'Completed')}
                          disabled={statusUpdateLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {statusUpdateLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check-circle mr-2"></i> Mark as Completed
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking._id, 'Cancelled')}
                        disabled={statusUpdateLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {statusUpdateLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times mr-2"></i> Cancel Booking
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderBookings;