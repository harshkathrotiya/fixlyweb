import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';

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
        setError('Error fetching booking details');
      }
    };

    fetchBooking();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/api/bookings/${id}/status`, { status });
      setBooking({ ...booking, bookingStatus: status });
    } catch (err) {
      setError('Error updating booking status');
    }
  };

  if (!booking) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Booking Details</h2>
        
        {error && <p className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</p>}

        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Booking #{booking._id}</h3>
          <p><span className="font-medium">Client:</span> {booking.customerId?.firstName} {booking.customerId?.lastName}</p>
          <p><span className="font-medium">Service:</span> {booking.serviceListingId?.serviceTitle}</p>
          <p><span className="font-medium">Date:</span> {new Date(booking.serviceDateTime).toLocaleDateString()}</p>
          <p><span className="font-medium">Time:</span> {new Date(booking.serviceDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p><span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.bookingStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
              booking.bookingStatus === 'Completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.bookingStatus}
            </span>
          </p>
          <p><span className="font-medium">Address:</span> {booking.serviceLocation}</p>
          <p><span className="font-medium">Contact:</span> {booking.customerId?.phone}</p>
          {booking.specialInstructions && (
            <p><span className="font-medium">Special Instructions:</span> {booking.specialInstructions}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleStatusUpdate('Confirmed')}
            disabled={booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Cancelled'}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Cancelled'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Accept
          </button>
          <button
            onClick={() => handleStatusUpdate('Completed')}
            disabled={booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Cancelled'}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Cancelled'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Mark as Completed
          </button>
          <button
            onClick={() => handleStatusUpdate('Cancelled')}
            disabled={booking.bookingStatus === 'Cancelled'}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              booking.bookingStatus === 'Cancelled'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Cancel
          </button>
        </div>

        <button 
          onClick={() => navigate('/provider/dashboard')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default BookingDetails;