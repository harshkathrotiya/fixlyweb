import React from 'react';

const ServiceDetailsInfo = ({ location, isActive, estimatedHours, serviceType }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#50B498] inline-block">Service Details</h3>
      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <i className="fas fa-map-marker-alt text-[#50B498] mt-1 mr-3 text-lg" aria-hidden="true"></i>
          <div>
            <h4 className="font-medium text-gray-800">Service Area</h4>
            <p className="text-gray-600">{location || 'Service area not specified'}</p>
          </div>
        </div>

        <div className="flex items-start">
          <i className="fas fa-calendar-alt text-[#50B498] mt-1 mr-3 text-lg" aria-hidden="true"></i>
          <div>
            <h4 className="font-medium text-gray-800">Availability</h4>
            <p className="text-gray-600">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1`} aria-hidden="true"></i>
                {isActive ? 'Currently Available' : 'Currently Unavailable'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <i className="fas fa-clock text-[#50B498] mt-1 mr-3 text-lg" aria-hidden="true"></i>
          <div>
            <h4 className="font-medium text-gray-800">Estimated Duration</h4>
            <p className="text-gray-600">{estimatedHours || '1-2'} hours</p>
          </div>
        </div>

        <div className="flex items-start">
          <i className="fas fa-shield-alt text-[#50B498] mt-1 mr-3 text-lg" aria-hidden="true"></i>
          <div>
            <h4 className="font-medium text-gray-800">Service Guarantee</h4>
            <p className="text-gray-600">Satisfaction guaranteed or your money back</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsInfo;