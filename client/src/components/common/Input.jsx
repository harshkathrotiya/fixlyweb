import React from 'react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-[#0b0e11] mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498] transition-colors ${error ? 'border-red-500' : 'border-[#939492]'} ${className} bg-[#ebf2f3]`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;