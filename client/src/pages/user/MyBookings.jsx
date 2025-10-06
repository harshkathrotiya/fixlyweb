import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import PlaceholderImg from '../../assets/plumbing.png';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

function MyBookings({ hideNavbar = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Determine which endpoint to use based on user role
      const endpoint = user.userType === 'service_provider' || user.role === 'service_provider'
        ? '/api/bookings/provider'
        : '/api/bookings/customer';

      const response = await api.get(endpoint);

      setBookings(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      const errorMessage = 'Failed to load your bookings. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus });

      // Refresh bookings after status update
      fetchBookings();
      
      // Show success message based on the action
      let successMessage = '';
      switch (newStatus) {
        case 'Confirmed':
          successMessage = 'Booking confirmed successfully!';
          break;
        case 'Completed':
          successMessage = 'Booking marked as completed!';
          break;
        case 'Cancelled':
          successMessage = 'Booking cancelled successfully!';
          break;
        case 'Rejected':
          successMessage = 'Booking rejected successfully!';
          break;
        default:
          successMessage = 'Booking status updated successfully!';
      }
      
      toast.success(successMessage);
    } catch (err) {
      console.error('Error updating booking status:', err);
      const errorMessage = 'Failed to update booking status. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const serviceDate = new Date(booking.serviceDateTime);

    if (activeTab === 'upcoming') {
      return serviceDate >= now && ['Pending', 'Confirmed'].includes(booking.bookingStatus);
    } else if (activeTab === 'completed') {
      return booking.bookingStatus === 'Completed';
    } else if (activeTab === 'cancelled') {
      return ['Cancelled', 'Rejected'].includes(booking.bookingStatus);
    }
    return true; // Show all if tab is not recognized
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-md">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {(user?.userType === 'service_provider' || user?.role === 'service_provider') ? 'Service Requests' : 'My Bookings'}
          </h1>
          <p className="text-gray-600">
            Manage your {(user?.userType === 'service_provider' || user?.role === 'service_provider') ? 'service requests' : 'service bookings'}
          </p>
        </div>

        <div className="flex justify-center mb-8 border-b border-gray-200">
          <div className="flex space-x-1">
            {['upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <i className="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-600 mb-6">No {activeTab} bookings found.</p>
            {activeTab === 'upcoming' && !(user?.userType === 'service_provider' || user?.role === 'service_provider') && (
              <Button
                onClick={() => navigate('/services')}
                className="flex items-center justify-center mx-auto"
              >
                <i className="fas fa-search mr-2"></i> Browse Services
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <Card key={booking._id}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Booking ID: {booking._id.substring(booking._id.length - 8)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.bookingStatus}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      <img
                        src={booking.serviceListingId?.serviceImage || PlaceholderImg}
                        alt={booking.serviceListingId?.serviceTitle}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = PlaceholderImg;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.serviceListingId?.serviceTitle || 'Service Unavailable'}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {booking.serviceListingId?.categoryId?.categoryName || 'General Service'}
                        </p>
                        <div className="flex items-center text-gray-600 mb-1">
                          <i className="fas fa-calendar-alt mr-2"></i>
                          <span>{formatDate(booking.serviceDateTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <i className="fas fa-tag mr-2"></i>
                          <span>₹{booking.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:border-l md:border-gray-200 md:pl-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {(user?.userType === 'service_provider' || user?.role === 'service_provider') ? 'Customer' : 'Provider'}
                      </h4>
                      <p className="text-gray-600">
                        {(user?.userType === 'service_provider' || user?.role === 'service_provider') ? (
                          `${booking.customerId?.firstName} ${booking.customerId?.lastName}`
                        ) : (
                          `${booking.serviceProviderId?.userId?.firstName} ${booking.serviceProviderId?.userId?.lastName}`
                        )}
                      </p>
                    </div>
                  </div>

                  {booking.specialInstructions && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions:</h4>
                      <p className="text-gray-600">{booking.specialInstructions}</p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {(user?.userType === 'service_provider' || user?.role === 'service_provider') && booking.bookingStatus === 'Pending' && (
                      <>
                        <Button
                          variant="success"
                          onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                          className="flex items-center"
                        >
                          <i className="fas fa-check mr-2"></i> Accept
                        </Button>
                      </>
                    )}

                    {(user?.userType === 'service_provider' || user?.role === 'service_provider') && booking.bookingStatus === 'Confirmed' && (
                      <Button
                        variant="success"
                        onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                        className="flex items-center"
                      >
                        <i className="fas fa-check-circle mr-2"></i> Mark as Completed
                      </Button>
                    )}

                    {(user?.userType === 'user' || user?.role === 'user') && booking.bookingStatus === 'Pending' && (
                      <Button
                        variant="danger"
                        onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                        className="flex items-center"
                      >
                        <i className="fas fa-ban mr-2"></i> Cancel Booking
                      </Button>
                    )}

                    {booking.bookingStatus === 'Completed' && (user?.userType === 'user' || user?.role === 'user') && !booking.isReviewed && (
                      <Button
                        onClick={() => navigate(`/review/${booking._id}`)}
                        className="flex items-center"
                      >
                        <i className="fas fa-star mr-2"></i> Leave Review
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/booking/${booking._id}`)}
                      className="flex items-center ml-auto"
                    >
                      <i className="fas fa-info-circle mr-2"></i> View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;