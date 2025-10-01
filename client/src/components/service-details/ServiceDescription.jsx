import React from 'react';

const ServiceDescription = ({ description, tags }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#50B498] inline-block">About This Service</h2>
      <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
      
      {tags?.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-[#DEF9C4] text-[#468585] px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDescription;