import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('revenue');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeFrame, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct API endpoint for specific report types
      const response = await api.get(
        `/api/reports/${reportType}?timeFrame=${timeFrame}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      setReportData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as an admin user.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be an administrator to view this data.');
        } else {
          setError(err.response.data?.message || 'Failed to load report data. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to load report data. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const handleApplyFilters = () => {
    fetchReportData();
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += reportData.tableHeaders.join(',') + '\n';
    
    // Add data rows
    reportData.tableData.forEach(row => {
      const values = Object.values(row).map(value => {
        // Escape commas and wrap strings in quotes
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = () => {
    if (!reportData || !reportData.labels || !reportData.datasets) {
      return <div className="p-6 text-center text-gray-500">No data available for the selected criteria</div>;
    }

    const chartData = {
      labels: reportData.labels,
      datasets: reportData.datasets.map((dataset, index) => {
        // Define colors for different datasets
        const colors = [
          'rgba(54, 162, 235, 0.5)',  // Blue
          'rgba(255, 99, 132, 0.5)',   // Red
          'rgba(75, 192, 192, 0.5)',   // Green
          'rgba(153, 102, 255, 0.5)',  // Purple
          'rgba(255, 159, 64, 0.5)',   // Orange
          'rgba(255, 205, 86, 0.5)'    // Yellow
        ];
        
        const borderColors = [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)'
        ];
        
        return {
          ...dataset,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2
        };
      })
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: getChartTitle(),
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    switch (reportType) {
      case 'revenue':
      case 'bookings':
        return <Bar ref={chartRef} data={chartData} options={options} height={300} />;
      case 'users':
      case 'providers':
        return <Line ref={chartRef} data={chartData} options={options} height={300} />;
      case 'categories':
      case 'services':
        return <Pie ref={chartRef} data={chartData} options={options} height={300} />;
      default:
        return <Bar ref={chartRef} data={chartData} options={options} height={300} />;
    }
  };

  const getChartTitle = () => {
    const titles = {
      revenue: 'Revenue Report',
      bookings: 'Bookings Report',
      users: 'User Growth Report',
      providers: 'Service Provider Growth Report',
      categories: 'Category Distribution Report',
      services: 'Services Distribution Report'
    };
    
    return titles[reportType] || 'Report';
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze platform performance and generate detailed reports.
            </p>
          </div>
        </div>
        
        {/* Report controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Report Configuration</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Report Type</label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                >
                  <option value="revenue">Revenue</option>
                  <option value="bookings">Bookings</option>
                  <option value="users">User Growth</option>
                  <option value="providers">Provider Growth</option>
                  <option value="categories">Category Distribution</option>
                  <option value="services">Services Distribution</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time Frame</label>
              <div className="relative">
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full px-2 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full px-2 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                  </>
                )}
              </button>
              {reportData && (
                <button
                  onClick={handleExport}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <i className="fas fa-download"></i>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Chart display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-96">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i className="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chart</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={fetchReportData}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{getChartTitle()}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} View
                    </span>
                  </div>
                </div>
                <div className="h-80">
                  {renderChart()}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary stats */}
        {reportData && reportData.summary && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                      <i className={`fas ${
                        key.includes('revenue') || key.includes('amount') ? 'fa-dollar-sign' :
                        key.includes('total') ? 'fa-chart-bar' :
                        key.includes('growth') ? 'fa-trending-up' :
                        key.includes('average') ? 'fa-calculator' :
                        'fa-chart-line'
                      }`}></i>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {key.includes('revenue') || key.includes('amount') ? formatCurrency(value) : value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Data table */}
        {reportData && reportData.tableData && reportData.tableData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Detailed Data</h3>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <i className="fas fa-download mr-1"></i>
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reportData.tableHeaders.map((header, index) => (
                      <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof cell === 'number' && (reportData.tableHeaders[cellIndex].toLowerCase().includes('revenue') || 
                                                       reportData.tableHeaders[cellIndex].toLowerCase().includes('amount'))
                            ? formatCurrency(cell)
                            : typeof cell === 'number' 
                            ? cell.toLocaleString()
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
};

export default Reports;