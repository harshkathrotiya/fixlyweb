import React from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles } from './adminStyles'; // Import the styles

/**
 * Reusable Button Component for Admin Pages
 *
 * @param {Object} props
 * @param {String} props.variant - Button variant (primary, secondary, success, danger, warning, info)
 * @param {String} props.size - Button size (sm, md, lg)
 * @param {Boolean} props.isLoading - Loading state
 * @param {Boolean} props.disabled - Disabled state
 * @param {String} props.icon - Optional icon name (FontAwesome)
 * @param {String} props.iconPosition - Icon position (left, right)
 * @param {String} props.type - Button type (button, submit, reset)
 * @param {String} props.to - Link destination (if button should be a Link)
 * @param {Function} props.onClick - Click handler
 * @param {String} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Button content
 */
function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  to,
  onClick,
  className = '',
  children,
  ...rest
}) {
  // Get variant classes from imported styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return buttonStyles.primary;
      case 'secondary':
        return buttonStyles.secondary;
      case 'success':
        return buttonStyles.success;
      case 'danger':
        return buttonStyles.danger;
      case 'warning':
        return buttonStyles.warning;
      case 'info':
        return buttonStyles.info;
      default:
        return buttonStyles.primary;
    }
  };

  // Get size classes from imported styles
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return buttonStyles.sm;
      case 'md':
        return buttonStyles.md;
      case 'lg':
        return buttonStyles.lg;
      default:
        return buttonStyles.md;
    }
  };

  // Combine all classes
  const buttonClasses = `${buttonStyles.base} ${getVariantClasses()} ${getSizeClasses()} ${className}`;

  // Render loading spinner
  const renderSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Render icon
  const renderIcon = () => icon && <i className={`fas fa-${icon} ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}></i>;

  // Render button content
  const renderContent = () => (
    <>
      {isLoading && renderSpinner()}
      {icon && iconPosition === 'left' && !isLoading && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </>
  );

  // If it's a link
  if (to) {
    return (
      <Link
        to={to}
        className={`${buttonClasses} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        {...rest}
      >
        {renderContent()}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {renderContent()}
    </button>
  );
}

export default Button;