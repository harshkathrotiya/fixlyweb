import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-toastify';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/api/bookings/${id}`);
        setBooking(response.data.data);
      } catch (err) {
        const errorMessage = 'Error fetching booking details';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchBooking();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const response = await api.put(`/api/bookings/${id}/status`, { status });
      setBooking(response.data.data);
      
      // Show success message based on the action
      let successMessage = '';
      switch (status) {
        case 'Confirmed':
          successMessage = 'Booking confirmed successfully!';
          break;
        case 'Completed':
          successMessage = 'Booking marked as completed!';
          break;
        case 'Cancelled':
          successMessage = 'Booking cancelled successfully!';
          break;
        default:
          successMessage = 'Booking status updated successfully!';
      }
      
      toast.success(successMessage);
    } catch (err) {
      const errorMessage = 'Error updating booking status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mr-3"></i>
            <p className="text-xl text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/bookings')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Bookings
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            {/* Remove the error display since we're using toast notifications now */}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">#{booking._id.substring(booking._id.length - 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(booking.serviceDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{new Date(booking.serviceDateTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.serviceListingId?.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{booking.serviceListingId?.categoryId?.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{booking.serviceListingId?.serviceLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{booking.customerId?.firstName} {booking.customerId?.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contact</p>
                  <p className="font-medium">{booking.customerId?.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{booking.customerId?.email}</p>
                </div>
              </div>
            </div>

            {booking.specialInstructions && (
              <div className="bg-blue-50 rounded-lg p-5 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Instructions</h3>
                <p className="text-gray-700">{booking.specialInstructions}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {booking.bookingStatus === 'Pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('Confirmed')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Accept Booking
                  </button>
                </>
              )}

              {booking.bookingStatus === 'Confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('Completed')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Mark as Completed
                </button>
              )}

              {['Pending', 'Confirmed'].includes(booking.bookingStatus) && (
                <button
                  onClick={() => handleStatusUpdate('Cancelled')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;