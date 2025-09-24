import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceTitle: '',
    servicePrice: '',
    serviceDetails: '',
    tags: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/listings/${id}`);
        const listing = response.data.data;
        setFormData({
          serviceTitle: listing.serviceTitle,
          servicePrice: listing.servicePrice,
          serviceDetails: listing.serviceDetails,
          tags: listing.tags ? listing.tags.join(',') : '',
          isActive: listing.isActive
        });
      } catch (err) {
        console.error('Error fetching listing details:', err);
        // Provide more specific error messages
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in as a service provider.');
          } else if (err.response.status === 403) {
            setError('Access denied. You must be the owner of this listing to edit it.');
          } else if (err.response.status === 404) {
            setError('Listing not found.');
          } else {
            setError(err.response.data?.message || 'Error fetching listing details');
          }
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('Error fetching listing details');
        }
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Process tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const submitData = {
        ...formData,
        tags: tagsArray,
        servicePrice: parseFloat(formData.servicePrice) || 0
      };
      
      const response = await api.put(`/api/listings/${id}`, submitData);
      
      if (response.data.success) {
        navigate('/provider/services');
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as a service provider.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be the owner of this listing to edit it.');
        } else if (err.response.status === 404) {
          setError('Listing not found.');
        } else {
          setError(err.response.data?.message || 'Error updating listing');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Error updating listing');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Service Listing</h2>
        <p className="mt-1 text-sm text-gray-600">Update your service listing details</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Service Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="serviceTitle"
            value={formData.serviceTitle}
            onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="servicePrice"
              value={formData.servicePrice}
              onChange={(e) => setFormData({...formData, servicePrice: e.target.value})}
              required
              min="0"
              step="0.01"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g., plumbing, emergency, 24/7"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Service Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="serviceDetails"
            value={formData.serviceDetails}
            onChange={(e) => setFormData({...formData, serviceDetails: e.target.value})}
            required
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Service is active
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/provider/services')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i> Update Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditListing;