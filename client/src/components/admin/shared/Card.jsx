import React from 'react';

/**
 * Reusable Card Component for Admin Pages
 *
 * @param {Object} props
 * @param {String} props.title - Card title
 * @param {ReactNode} props.icon - Card icon
 * @param {String} props.value - Card main value
 * @param {String} props.subtitle - Card subtitle
 * @param {String} props.trend - Trend direction ('up', 'down', 'neutral')
 * @param {String} props.trendValue - Trend value (e.g., '+15%')
 * @param {String} props.color - Card accent color
 * @param {Function} props.onClick - Click handler
 * @param {Boolean} props.loading - Loading state
 */
function Card({
  title,
  icon,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'indigo',
  onClick,
  loading = false
}) {
  // Define color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          iconBg: 'bg-purple-500',
          iconText: 'text-white',
          border: 'border-purple-100',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'green':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          iconBg: 'bg-purple-500',
          iconText: 'text-white',
          border: 'border-purple-100',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          iconBg: 'bg-purple-500',
          iconText: 'text-white',
          border: 'border-purple-100',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          iconBg: 'bg-amber-500',
          iconText: 'text-white',
          border: 'border-amber-100',
          gradient: 'from-amber-500 to-amber-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          iconBg: 'bg-red-500',
          iconText: 'text-white',
          border: 'border-red-100',
          gradient: 'from-red-500 to-red-600'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          iconBg: 'bg-indigo-500',
          iconText: 'text-white',
          border: 'border-indigo-100',
          gradient: 'from-indigo-500 to-indigo-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-500',
          iconText: 'text-white',
          border: 'border-gray-100',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  // Get trend icon and color
  const getTrendClasses = () => {
    if (!trend) return {};

    switch (trend) {
      case 'up':
        return {
          icon: 'fas fa-arrow-up',
          color: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'down':
        return {
          icon: 'fas fa-arrow-down',
          color: 'text-red-600',
          bg: 'bg-red-50'
        };
      default:
        return {
          icon: 'fas fa-minus',
          color: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const colorClasses = getColorClasses();
  const trendClasses = getTrendClasses();

  return (
    <div
      className={`bg-white rounded-xl border ${colorClasses.border} p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1 group relative overflow-hidden`}
      onClick={onClick}
    >
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10 flex items-center">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${colorClasses.gradient} rounded-lg flex items-center justify-center text-lg ${colorClasses.iconText} shadow-md`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          {loading ? (
            <div className="mt-2 flex justify-center">
              <div className="loader" style={{ width: '32px', height: '32px' }}></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          
          {/* Subtitle and Trend */}
          <div className="mt-2 flex items-center justify-between">
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendClasses.bg}`}>
                <i className={`${trendClasses.icon} text-xs ${trendClasses.color}`}></i>
                <span className={`text-xs font-semibold ${trendClasses.color}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click indicator */}
      {onClick && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <i className="fas fa-external-link-alt text-xs text-gray-400"></i>
        </div>
      )}
    </div>
  );
}

export default Card;
