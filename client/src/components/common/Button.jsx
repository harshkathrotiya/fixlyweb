import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white focus:ring-[#50B498]',
    secondary: 'bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] hover:from-[#9CDBA6] hover:to-[#50B498] text-[#0b0e11] focus:ring-[#50B498]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white focus:ring-[#50B498]',
    outline: 'bg-transparent border border-[#50B498] text-[#50B498] hover:bg-[#DEF9C4] focus:ring-[#50B498]'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // If className contains custom background styles, don't apply variant classes
  const hasCustomBackground = className.includes('bg-') || className.includes('from-') || className.includes('to-');
  const finalVariantClasses = hasCustomBackground ? '' : variantClasses[variant];
  
  const classes = `${baseClasses} ${finalVariantClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button 
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;