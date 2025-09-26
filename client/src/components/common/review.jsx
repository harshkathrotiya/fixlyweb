import React, { useEffect, useState } from "react";
import api from "../../config/api";
import { motion } from "framer-motion";

const ReviewCard = () => {
  const [reviews, setReviews] = useState([]);

  // Fetch latest reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/api/reviews');
        // Handle the response format from our API
        if (response.data && response.data.success && response.data.data) {
          // Format the reviews for display
          const formattedReviews = response.data.data.slice(0, 6).map(review => ({
            name: review.customerId ? `${review.customerId.firstName} ${review.customerId.lastName}` : 'Anonymous',
            text: review.reviewText || 'Great service!',
            rating: review.rating || 5
          }));
          setReviews(formattedReviews);
        } else {
          // Fallback to sample reviews if API doesn't return expected format
          setReviews([
            { name: "Piyush Jha", text: "Vitalii assembled the IKEA Norli drawer chest for me...", rating: 5 },
            { name: "Devangi Patel", text: "David did an awesome job assembling crib and dresser for nursery...", rating: 4 },
            { name: "Anant Shah", text: "I hired Joe to patch 2 holes on my wall and 1 hole on my ceiling...", rating: 5 }
          ]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 mb-3">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`fas fa-star ${i < rating ? '' : 'text-gray-300'}`}></i>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-2xl p-8 text-left shadow-lg transition-all duration-300 border border-gray-100 hover:shadow-xl hover:-translate-y-2 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -10 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {review.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">{review.name}</h3>
              {renderStars(review.rating)}
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed relative">
            <span className="absolute top-0 left-0 text-5xl text-blue-100 font-serif">"</span>
            <span className="relative z-10">{review.text}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewCard;