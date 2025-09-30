import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceholderImg from '../../assets/plumbing.png';
import Button from '../common/Button'; // Import the standardized Button component

const RelatedServices = ({ services }) => {
  const navigate = useNavigate();

  if (!services || services.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-l-4 border-[#50B498] pl-2">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-48 overflow-hidden">
              <img
                src={service.serviceImage || service.images?.[0] || PlaceholderImg}
                alt={service.serviceTitle}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => {
                  e.target.src = PlaceholderImg;
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{service.serviceTitle}</h3>
              <div className="flex justify-between items-center mb-3">
                <div className="text-[#468585] font-bold text-lg">₹{service.servicePrice}</div>
                {service.averageRating > 0 && (
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 text-sm mr-1" aria-hidden="true"></i>
                    <span className="text-gray-700 text-sm">{service.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.serviceDetails?.length > 60
                  ? `${service.serviceDetails.substring(0, 60)}...`
                  : service.serviceDetails}
              </p>
              <Button
                variant="outline"
                className="w-full py-2 px-4 text-sm"
                onClick={() => navigate(`/listing/${service._id}`)}
                aria-label={`View details for ${service.serviceTitle}`}
              >
                <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i> View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedServices;