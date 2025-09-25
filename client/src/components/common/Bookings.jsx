import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/bookings/customer');
        setBookings(response.data.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, bookingStatus: 'Cancelled' }
          : booking
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
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
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (booking) => {
    return ['Pending', 'Confirmed'].includes(booking.bookingStatus) &&
           new Date(booking.serviceDateTime) > new Date();
  };

  const isPast = (booking) => {
    return booking.bookingStatus === 'Completed' ||
           booking.bookingStatus === 'Cancelled' ||
           (booking.bookingStatus !== 'Cancelled' && new Date(booking.serviceDateTime) < new Date());
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return isUpcoming(booking);
    if (activeTab === 'past') return isPast(booking);
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">My Bookings</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg text-gray-500">
          <p className="mb-4">No {activeTab} bookings found.</p>
          {activeTab === 'upcoming' && (
            <Link to="/services" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 pb-4 border-b border-gray-100">
                <div className="service-info mb-3 md:mb-0">
                  <h3 className="text-xl font-semibold text-gray-900">{booking.serviceListingId?.serviceTitle}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    by {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}
                  </p>
                </div>
                <div className="booking-status">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="detail-item">
                  <span className="text-xs text-gray-500 block mb-1">Date:</span>
                  <span className="text-gray-900">{formatDate(booking.serviceDateTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="text-xs text-gray-500 block mb-1">Time:</span>
                  <span className="text-gray-900">{formatTime(booking.serviceDateTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="text-xs text-gray-500 block mb-1">Location:</span>
                  <span className="text-gray-900">{booking.serviceLocation}</span>
                </div>
                <div className="detail-item">
                  <span className="text-xs text-gray-500 block mb-1">Amount:</span>
                  <span className="text-blue-600 font-medium">₹{booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                {booking.bookingStatus === 'Pending' && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancel Booking
                  </button>
                )}

                {booking.bookingStatus === 'Confirmed' && (
                  <>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
                    >
                      Cancel Booking
                    </button>
                    <Link
                      to={`/payment/${booking._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Make Payment
                    </Link>
                  </>
                )}

                {booking.bookingStatus === 'Completed' && !booking.isReviewed && (
                  <Link
                    to={`/review/${booking._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Write Review
                  </Link>
                )}

                {booking.bookingStatus !== 'Cancelled' && (
                  <Link
                    to={`/complaint/${booking._id}`}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Submit Complaint
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;