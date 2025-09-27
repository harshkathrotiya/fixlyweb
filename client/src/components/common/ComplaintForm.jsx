import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function ComplaintForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [complaintType, setComplaintType] = useState('Service Quality');
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (complaintText.trim() === '') {
      setError('Please provide details about your complaint.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/api/complaints', {
        bookingId,
        complaintType,
        complaintText
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking && !error) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">Loading booking details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Submit a Complaint</h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-md text-center">
            <h3 className="text-xl font-semibold mb-2">Complaint Submitted Successfully</h3>
            <p className="mb-1">We've received your complaint and will review it shortly.</p>
            <p>Redirecting to your appointments...</p>
          </div>
        ) : (
          booking && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900">{booking.serviceListingId?.serviceTitle}</h3>
                <p className="text-gray-600">Provider: {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}</p>
                <p className="text-gray-600">Date: {new Date(booking.serviceDateTime).toLocaleDateString()}</p>
                <p className="text-gray-600">Status: {booking.bookingStatus}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700">
                  Complaint Type:
                </label>
                <select
                  id="complaintType"
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Service Quality">Service Quality</option>
                  <option value="Provider Behavior">Provider Behavior</option>
                  <option value="Pricing Issue">Pricing Issue</option>
                  <option value="Booking Issue">Booking Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="complaintText" className="block text-sm font-medium text-gray-700">
                  Complaint Details:
                </label>
                <textarea
                  id="complaintText"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Please provide details about your complaint..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                <div className="text-right text-sm text-gray-500">{complaintText.length}/1000</div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

export default ComplaintForm;