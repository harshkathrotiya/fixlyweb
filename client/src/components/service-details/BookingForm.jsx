import React from 'react';
import Button from '../common/Button'; // Import the standardized Button component

const BookingForm = ({ 
  bookingDetails, 
  onBookingDetailsChange, 
  onSubmit, 
  onClose, 
  title, 
  provider, 
  servicePrice, 
  bookingError
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="booking-form-title">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 id="booking-form-title" className="text-xl font-bold text-gray-800">Book "{title}"</h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
            aria-label="Close booking form"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        {bookingError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded" role="alert">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-2" aria-hidden="true"></i>
              <p className="text-red-700">{bookingError}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-5">
            <label htmlFor="bookingDate" className="block text-gray-700 mb-2 font-medium">Preferred Date</label>
            <input
              type="date"
              id="bookingDate"
              value={bookingDetails.date}
              onChange={(e) => onBookingDetailsChange({ ...bookingDetails, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#50B498]"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="bookingTime" className="block text-gray-700 mb-2 font-medium">Preferred Time</label>
            <input
              type="time"
              id="bookingTime"
              value={bookingDetails.time}
              onChange={(e) => onBookingDetailsChange({ ...bookingDetails, time: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#50B498]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="bookingNotes" className="block text-gray-700 mb-2 font-medium">Additional Notes</label>
            <textarea
              id="bookingNotes"
              value={bookingDetails.notes}
              onChange={(e) => onBookingDetailsChange({ ...bookingDetails, notes: e.target.value })}
              placeholder="Describe your specific needs or any questions you have for the service provider..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#50B498]"
            ></textarea>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Booking Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">
                  {provider.userId
                    ? `${provider.userId.firstName || ''} ${provider.userId.lastName || ''}`
                    : 'Professional Provider'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>
                  {bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString() : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{bookingDetails.time || 'Not selected'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-[#468585]">₹{servicePrice}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-[#50B498] flex items-center">
              <i className="fas fa-info-circle mr-2" aria-hidden="true"></i>
              <p>You won't be charged until the service is completed</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3"
          >
            <i className="fas fa-calendar-check mr-2" aria-hidden="true"></i> Confirm Booking
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;