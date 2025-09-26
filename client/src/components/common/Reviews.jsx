import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function Reviews() {
  const { providerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/reviews/provider/${providerId}`);
        setReviews(response.data.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (providerId) {
      fetchReviews();
    }
  }, [providerId, token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Customer Reviews</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          Loading reviews...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg text-gray-500">
          <p>No reviews yet for this service provider.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                  <img
                    src={review.customerId?.profilePicture || 'https://via.placeholder.com/40'}
                    alt={`${review.customerId?.firstName || 'Anonymous'}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{review.customerId?.firstName} {review.customerId?.lastName}</h4>
                    <p className="text-xs text-gray-500">{formatDate(review.reviewDateTime)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="mb-4 text-gray-700">
                <p>{review.reviewText}</p>
              </div>
              <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                <span>Service: </span>
                <span className="font-medium text-blue-600">{review.bookingId?.serviceListingId?.serviceTitle || 'Unknown Service'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;