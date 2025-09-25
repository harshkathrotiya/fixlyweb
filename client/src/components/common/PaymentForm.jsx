import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function PaymentForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        setBooking(response.data.data);

        // Check if booking is pending
        if (response.data.data.bookingStatus !== 'Pending') {
          setError('This booking has already been processed.');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, token]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const validateForm = () => {
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      if (!cardNumber.trim()) {
        setError('Please enter card number');
        return false;
      }
      if (!cardName.trim()) {
        setError('Please enter cardholder name');
        return false;
      }
      if (!expiryDate.trim()) {
        setError('Please enter expiry date');
        return false;
      }
      if (!cvv.trim()) {
        setError('Please enter CVV');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate a mock transaction ID
      const transactionId = 'TXN' + Date.now().toString();

      await api.post('/api/payments', {
        bookingId,
        paymentMethod,
        transactionId
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 3000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking && !error) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">Loading booking details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Payment Details</h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-md text-center">
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="mb-1">Your booking has been confirmed.</p>
            <p>Redirecting to your appointments...</p>
          </div>
        ) : (
          booking && booking.bookingStatus === 'Pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.serviceListingId?.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(booking.serviceDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{new Date(booking.serviceDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-semibold text-blue-600">₹{booking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card Number:
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                        Cardholder Name:
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry Date:
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                          CVV:
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="space-y-2">
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
                      UPI ID:
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">Please transfer the amount to the following account:</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium">Fixly Services</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IFSC Code:</span>
                        <span className="font-medium">ABCD0001234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">Example Bank</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${booking?.totalAmount.toFixed(2)}`}
                </button>
              </form>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PaymentForm;