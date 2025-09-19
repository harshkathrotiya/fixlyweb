import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Table Component for Admin Pages
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions with {header, accessor, Cell}
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.onSort - Function to handle sorting
 * @param {Object} props.sortConfig - Current sort configuration {key, direction}
 * @param {Object} props.pagination - Pagination object {page, total, limit}
 * @param {Function} props.onPageChange - Function to handle page change
 * @param {Boolean} props.isLoading - Loading state
 * @param {String} props.emptyMessage - Message to display when no data
 * @param {String} props.className - Additional CSS classes
 */
function Table({
  columns,
  data,
  onSort,
  sortConfig,
  pagination,
  onPageChange,
  isLoading,
  emptyMessage = "No data found",
  className = ""
}) {
  // Handle column header click for sorting
  const handleHeaderClick = (accessor) => {
    if (onSort) {
      onSort(accessor);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;

    const { page, total, limit } = pagination;
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNumber
                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        <tr>
          <td colSpan={columns.length} className="px-6 py-12 text-center">
            <div className="flex justify-center">
              <div className="loader"></div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <i className="fas fa-inbox text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{emptyMessage}</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      scope="col"
                      className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 ${
                        onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => onSort && handleHeaderClick(column.accessor)}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {sortConfig && sortConfig.key === column.accessor && (
                          <span className="ml-2 text-purple-600">
                            <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-xs`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              {isLoading ? renderSkeleton() : data.length > 0 ? (
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      {columns.map((column) => (
                        <td key={column.accessor} className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {column.Cell ? column.Cell(row) : row[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : renderEmptyState()}
            </table>
          </div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}

export default Table;