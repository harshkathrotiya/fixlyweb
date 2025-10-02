import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceholderImg from '../../assets/plumbing.png';
import Button from '../common/Button'; // Import the standardized Button component

const ServiceProviderInfo = ({ provider, onContactProvider }) => {
  const navigate = useNavigate();
  
  if (!provider) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#50B498] inline-block">Service Provider</h3>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <img
            src={provider.userId?.profilePicture || PlaceholderImg}
            alt={`${provider.userId?.firstName || ''} ${provider.userId?.lastName || ''} profile picture`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = PlaceholderImg;
            }}
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">
            {provider.userId
              ? `${provider.userId.firstName || ''} ${provider.userId.lastName || ''}`
              : 'Professional Provider'}
          </h4>
          {provider.verificationStatus === 'verified' && (
            <div className="flex items-center text-green-600 text-sm mt-1">
              <i className="fas fa-badge-check mr-1" aria-hidden="true"></i>
              <span>Verified Professional</span>
            </div>
          )}
          {provider.rating > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400 mr-1" role="img" aria-label={`${provider.rating.toFixed(1)} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${i < Math.round(provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-hidden="true"
                  ></i>
                ))}
              </div>
              <span className="text-gray-700 text-sm">{provider.rating.toFixed(1)} rating</span>
            </div>
          )}
        </div>
      </div>

      {provider.description && (
        <p className="text-gray-600 text-sm mb-4 italic">"{provider.description}"</p>
      )}

      <div className="space-y-3 mb-6">
        {provider.contactEmail && (
          <div className="flex items-center text-gray-700">
            <i className="fas fa-envelope text-[#50B498] mr-3" aria-hidden="true"></i>
            <span>{provider.contactEmail}</span>
          </div>
        )}
        {provider.contactPhone && (
          <div className="flex items-center text-gray-700">
            <i className="fas fa-phone text-[#50B498] mr-3" aria-hidden="true"></i>
            <span>{provider.contactPhone}</span>
          </div>
        )}
        {provider.businessName && (
          <div className="flex items-center text-gray-700">
            <i className="fas fa-building text-[#50B498] mr-3" aria-hidden="true"></i>
            <span>{provider.businessName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 py-2 px-4"
          onClick={() => navigate(`/provider/profile/${provider._id}`)}
          aria-label={`View profile of ${provider.userId?.firstName || 'provider'}`}
        >
          <i className="fas fa-user-circle mr-2" aria-hidden="true"></i> View Profile
        </Button>
        <Button
          variant="outline"
          className="flex-1 py-2 px-4"
          onClick={onContactProvider}
          aria-label={`Contact ${provider.userId?.firstName || 'provider'}`}
        >
          <i className="fas fa-comment-dots mr-2" aria-hidden="true"></i> Message
        </Button>
      </div>
    </div>
  );
};

export default ServiceProviderInfo;