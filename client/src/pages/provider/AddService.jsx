import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx

function AddService() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    serviceTitle: '',
    categoryId: '',
    serviceDetails: '',
    servicePrice: '',
    duration: '',
    serviceLocation: '',
    serviceImages: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Preview images
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newImagePreviews]);

    // Store files for upload
    setFormData({
      ...formData,
      serviceImages: [...formData.serviceImages, ...files]
    });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreview];
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);

    const updatedImages = [...formData.serviceImages];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      serviceImages: updatedImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceTitle.trim()) {
      setError('Service title is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!formData.serviceDetails.trim()) {
      setError('Service description is required');
      return;
    }
    if (!formData.servicePrice || isNaN(formData.servicePrice) || Number(formData.servicePrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create form data for file upload
      const serviceData = new FormData();
      serviceData.append('serviceTitle', formData.serviceTitle);
      serviceData.append('categoryId', formData.categoryId);
      serviceData.append('serviceDetails', formData.serviceDetails);
      serviceData.append('servicePrice', formData.servicePrice);
      serviceData.append('duration', formData.duration);
      serviceData.append('serviceLocation', formData.serviceLocation);

      // Append each image - only use the first image for now
      if (formData.serviceImages.length > 0) {
        serviceData.append('serviceImage', formData.serviceImages[0]);
      }

      await api.post('/api/listings', serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/provider/services');
    } catch (err) {
      console.error('Error adding service:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as a service provider.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be a service provider to add services.');
        } else {
          setError(err.response.data?.message || 'Failed to add service. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to add service. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Service</h2>
        <p className="mt-1 text-sm text-gray-600">Create a new service listing to offer to customers</p>
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
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="e.g. Professional Home Cleaning"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.categoryName}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="serviceDetails"
            name="serviceDetails"
            value={formData.serviceDetails}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your service in detail..."
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
              name="servicePrice"
              value={formData.servicePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter price"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              step="0.5"
              placeholder="e.g. 2"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="serviceLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Service Location
          </label>
          <input
            type="text"
            id="serviceLocation"
            name="serviceLocation"
            value={formData.serviceLocation}
            onChange={handleChange}
            placeholder="e.g. Ahmedabad, Gujarat"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mx-auto"></i>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="serviceImages" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="serviceImages"
                        name="serviceImages"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            to="/provider/services"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Adding Service...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i> Add Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddService;