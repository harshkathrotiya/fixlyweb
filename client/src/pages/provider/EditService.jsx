import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx

function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);

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
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/listings/${serviceId}`);

        const serviceData = response.data.data;
        console.log('Fetched service data:', serviceData);

        // Make sure we have all the data we need
        if (!serviceData) {
          throw new Error('No service data returned from the server');
        }

        setFormData({
          serviceTitle: serviceData.serviceTitle || '',
          categoryId: serviceData.categoryId?._id || serviceData.categoryId || '',
          serviceDetails: serviceData.serviceDetails || '',
          servicePrice: serviceData.servicePrice ? serviceData.servicePrice.toString() : '',
          duration: serviceData.duration ? serviceData.duration.toString() : '',
          serviceLocation: serviceData.serviceLocation || '',
          serviceImages: []
        });

        if (serviceData.serviceImage) {
          setExistingImages([serviceData.serviceImage]);
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        // Provide more specific error messages
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in as a service provider.');
          } else if (err.response.status === 403) {
            setError('Access denied. You must be the owner of this service to edit it.');
          } else if (err.response.status === 404) {
            setError('Service not found.');
          } else {
            setError(err.response.data?.message || 'Failed to load service details. Please try again.');
          }
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('Failed to load service details. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

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

  const removeNewImage = (index) => {
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

  const removeExistingImage = (index) => {
    const updatedExistingImages = [...existingImages];
    updatedExistingImages.splice(index, 1);
    setExistingImages(updatedExistingImages);
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

    // Log what we're submitting for debugging
    console.log('Submitting form data:', formData);

    setIsSubmitting(true);
    setError(null);

    try {
      // Log what we're submitting
      console.log('Form data being submitted:', formData);

      // Create form data for file upload
      const serviceData = new FormData();
      serviceData.append('serviceTitle', formData.serviceTitle);
      serviceData.append('categoryId', formData.categoryId);
      serviceData.append('serviceDetails', formData.serviceDetails);

      // Make sure price is a valid number
      if (formData.servicePrice) {
        const priceValue = parseFloat(formData.servicePrice);
        if (!isNaN(priceValue)) {
          console.log('Appending valid price:', priceValue);
          serviceData.append('servicePrice', priceValue.toString());
        } else {
          console.log('Invalid price value:', formData.servicePrice);
        }
      }

      // Make sure duration is a valid number
      if (formData.duration) {
        const durationValue = parseInt(formData.duration);
        if (!isNaN(durationValue)) {
          serviceData.append('duration', durationValue.toString());
        }
      }

      serviceData.append('serviceLocation', formData.serviceLocation || '');

      // Add tags if needed
      serviceData.append('tags', '');

      // Handle image if needed
      if (existingImages.length > 0) {
        serviceData.append('serviceImage', existingImages[0]);
      } else if (formData.serviceImages.length > 0) {
        serviceData.append('serviceImage', formData.serviceImages[0]);
      }

      // Check if we have any file uploads
      const hasFileUploads = formData.serviceImages && formData.serviceImages.length > 0;

      let response;

      if (hasFileUploads) {
        // If we're uploading files, use FormData
        response = await api.put(`/api/listings/${serviceId}`, serviceData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Otherwise, send as JSON
        const jsonData = {
          serviceTitle: formData.serviceTitle,
          categoryId: formData.categoryId,
          serviceDetails: formData.serviceDetails,
          servicePrice: parseFloat(formData.servicePrice),
          duration: parseInt(formData.duration) || 0,
          serviceLocation: formData.serviceLocation || ''
        };

        response = await api.put(`/api/listings/${serviceId}`, jsonData);
      }

      console.log('Service updated successfully:', response.data);
      navigate('/provider/services');
    } catch (err) {
      console.error('Error updating service:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as a service provider.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be the owner of this service to edit it.');
        } else if (err.response.status === 404) {
          setError('Service not found.');
        } else {
          setError(err.response.data?.message || 'Failed to update service. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to update service. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
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
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            required
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
            required
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
            required
            rows={4}
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
              required
              min="0"
              step="0.01"
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
              step="1"
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
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Image
          </label>
          <div className="mt-1 flex items-center">
            {existingImages.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt="Current service" className="h-24 w-24 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No current image</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Replace Image
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
                        onClick={() => removeNewImage(index)}
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
                <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i> Update Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditService;