/**
 * Shared Tailwind CSS styles for admin components
 * This file centralizes all admin UI styling to ensure consistency
 */

// Color scheme
export const colors = {
  primary: 'purple-600',
  primaryHover: 'purple-700',
  secondary: 'gray-500',
  secondaryHover: 'gray-600',
  success: 'green-500',
  successHover: 'green-600',
  danger: 'red-500',
  dangerHover: 'red-600',
  warning: 'yellow-500',
  warningHover: 'yellow-600',
  info: 'blue-500',
  infoHover: 'blue-600',
};

// Layout styles
export const layoutStyles = {
  container: "bg-gray-50 min-h-screen",
  content: "p-6",
  section: "mb-6",
};

// Card styles
export const cardStyles = {
  container: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
  header: "px-6 py-4 border-b border-gray-200 flex justify-between items-center",
  title: "text-xl font-semibold text-gray-800",
  body: "p-6",
  footer: "px-6 py-4 bg-gray-50 border-t border-gray-200",
};

// Button styles
export const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
  // Sizes
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  // Variants
  primary: `bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`,
  secondary: `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500`,
  success: `bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500`,
  danger: `bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`,
  warning: `bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500`,
  info: `bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500`,
  // Icon only
  icon: "p-2 rounded-full",
};

// Table styles
export const tableStyles = {
  container: "overflow-x-auto",
  table: "min-w-full divide-y divide-gray-200",
  thead: "bg-gray-50",
  th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tbody: "bg-white divide-y divide-gray-200",
  tr: "hover:bg-gray-50 transition-colors duration-150",
  td: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
  // Actions
  actions: "flex space-x-2",
  actionButton: "text-purple-600 hover:text-purple-900",
  editButton: "text-purple-600 hover:text-purple-900",
  deleteButton: "text-red-600 hover:text-red-900",
  viewButton: "text-purple-600 hover:text-purple-900",
  successButton: "text-purple-600 hover:text-purple-900",
  warningButton: "text-yellow-600 hover:text-yellow-900",
  infoButton: "text-purple-600 hover:text-purple-900",
};

// Form styles
export const formStyles = {
  group: "mb-4",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm",
  select: "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm",
  textarea: "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm",
  checkbox: "h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded",
  radio: "h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300",
  error: "mt-1 text-sm text-red-600",
  hint: "mt-1 text-sm text-gray-500",
};

// Status badge styles
export const badgeStyles = {
  base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  // Status variants
  active: "bg-purple-100 text-purple-800",
  inactive: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-gray-100 text-gray-800",
  // Role variants
  admin: "bg-purple-100 text-purple-800",
  user: "bg-purple-100 text-purple-800",
  provider: "bg-purple-100 text-purple-800",
};

// Modal styles
export const modalStyles = {
  overlay: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
  container: "fixed inset-0 z-10 overflow-y-auto",
  content: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
  panel: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
  header: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
  title: "text-lg font-medium leading-6 text-gray-900",
  body: "bg-white px-4 pb-4 pt-5 sm:p-6 sm:pt-4",
  footer: "bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6",
};

// Stats card styles
export const statsCardStyles = {
  container: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200",
  title: "text-sm font-medium text-gray-500 truncate",
  value: "mt-1 text-3xl font-semibold text-gray-900",
  icon: "flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white",
  footer: "mt-4 flex items-center text-sm font-medium text-gray-500",
  trend: {
    up: "text-purple-600",
    down: "text-red-600",
    neutral: "text-gray-500"
  }
};

// Pagination styles
export const paginationStyles = {
  container: "flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6",
  button: "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
  activeButton: "relative inline-flex items-center rounded-md border border-purple-500 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600",
  disabledButton: "relative inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed",
};

// Filter styles
export const filterStyles = {
  container: "mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200",
  form: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  group: "flex flex-col relative",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm pl-9",
  select: "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm pl-9 appearance-none",
  selectIcon: "absolute right-3 bottom-2.5 text-gray-400 pointer-events-none",
  inputIcon: "absolute left-3 bottom-2.5 text-gray-400",
  actions: "flex items-center justify-end mt-4 space-x-2 md:self-end",
  searchButton: "inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[80px] max-w-[100px] w-auto",
  resetButton: "inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[80px] max-w-[100px] w-auto",
};

// Breadcrumb styles
export const breadcrumbStyles = {
  container: "flex items-center space-x-2 text-sm text-gray-500",
  item: "hover:text-gray-700",
  separator: "text-gray-400",
  active: "text-gray-900 font-medium",
};

// Alert styles
export const alertStyles = {
  base: "rounded-md p-4 mb-4",
  success: "bg-purple-50 border border-purple-200",
  error: "bg-red-50 border border-red-200",
  warning: "bg-yellow-50 border border-yellow-200",
  info: "bg-purple-50 border border-purple-200",
  title: "text-sm font-medium",
  titleSuccess: "text-purple-800",
  titleError: "text-red-800",
  titleWarning: "text-yellow-800",
  titleInfo: "text-purple-800",
  message: "mt-2 text-sm",
  messageSuccess: "text-purple-700",
  messageError: "text-red-700",
  messageWarning: "text-yellow-700",
  messageInfo: "text-purple-700",
};

// Empty state styles
export const emptyStateStyles = {
  container: "text-center py-12",
  icon: "mx-auto h-12 w-12 text-gray-400",
  title: "mt-2 text-lg font-medium text-gray-900",
  description: "mt-1 text-sm text-gray-500",
  action: "mt-6",
};

// Loading state styles
export const loadingStyles = {
  container: "flex justify-center items-center py-12",
  spinner: "animate-spin h-8 w-8 text-purple-600",
};
