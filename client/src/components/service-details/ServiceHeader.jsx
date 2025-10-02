import React from 'react';

const ServiceHeader = ({ 
  title, 
  categoryName, 
  createdAt, 
  averageRating, 
  reviewCount, 
  isActive, 
  getTimeSince, 
  formatDate,
  onShare
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center text-gray-700">
            <i className="fas fa-tag text-[#50B498] mr-2" aria-hidden="true"></i>
            <span className="font-medium">{categoryName || 'General Service'}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <i className="fas fa-clock text-[#50B498] mr-2" aria-hidden="true"></i>
            <span title={formatDate(createdAt)}>Listed {getTimeSince(createdAt)}</span>
          </div>

          {averageRating > 0 && (
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-1" role="img" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-hidden="true"
                  ></i>
                ))}
              </div>
              <span className="text-gray-700 mr-1">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
            </div>
          )}

          {isActive && (
            <div className="flex items-center text-green-600">
              <i className="fas fa-check-circle mr-2" aria-hidden="true"></i>
              <span className="font-medium">Available Now</span>
            </div>
          )}
        </div>
      </div>
      
      <button 
        className="text-gray-500 hover:text-[#50B498] p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={onShare}
        aria-label="Share this service"
      >
        <i className="fas fa-share-alt text-xl" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default ServiceHeader;