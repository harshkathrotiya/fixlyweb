import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ServiceCard = ({ service, onView, onEdit, onToggleActive, onDelete }) => {
  const { isServiceProvider } = useAuth();
  
  // For providers, "View" should go to edit page instead of customer view
  const handleViewClick = (e) => {
    e.preventDefault();
    if (isServiceProvider()) {
      // If user is a provider, redirect to edit page
      onEdit();
    } else {
      // For customers, use the original view function
      onView();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Service Image */}
      <div className="h-48 overflow-hidden">
        {service.serviceImage ? (
          <img 
            src={service.serviceImage} 
            alt={service.serviceTitle} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <i className="fas fa-image text-gray-400 text-4xl"></i>
          </div>
        )}
      </div>
      
      {/* Service Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 truncate">{service.serviceTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {service.categoryId?.categoryName || 'Uncategorized'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">₹{service.servicePrice?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500">per service</p>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {service.serviceDetails || 'No description provided'}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleViewClick}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <i className="fas fa-eye mr-1"></i> {isServiceProvider() ? 'Edit' : 'View'}
            </button>
            {isServiceProvider() && (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <i className="fas fa-edit mr-1"></i> Edit Details
              </button>
            )}
          </div>
          
          <button
            onClick={onToggleActive}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              service.isActive
                ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
            }`}
          >
            {service.isActive ? (
              <>
                <i className="fas fa-pause mr-1"></i> Deactivate
              </>
            ) : (
              <>
                <i className="fas fa-play mr-1"></i> Activate
              </>
            )}
          </button>
        </div>
        
        <div className="mt-3 flex justify-end">
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <i className="fas fa-trash mr-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;