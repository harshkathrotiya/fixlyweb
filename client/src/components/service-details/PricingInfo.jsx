import React from 'react';

const PricingInfo = ({ servicePrice, providerEarning, commissionAmount, userRole }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] rounded-xl border-l-4 border-[#50B498] mb-6 shadow-sm">
      <div className="flex items-center">
        <div className="text-3xl font-bold text-[#468585] mr-3">₹{servicePrice}</div>
        <div className="text-sm text-gray-500">starting price</div>
      </div>
      
      {userRole === 'provider' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-3 rounded-lg shadow-sm w-full sm:w-auto">
          <div className="flex justify-between">
            <span className="text-gray-600">Your Earning:</span>
            <span className="font-medium text-green-600">₹{providerEarning}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee:</span>
            <span className="font-medium text-red-600">₹{commissionAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingInfo;