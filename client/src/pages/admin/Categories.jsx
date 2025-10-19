import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/admin/shared/Table';
import Modal from '../../components/admin/shared/Modal';
import Button from '../../components/admin/shared/Button';
import Badge from '../../components/admin/shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles } from '../../components/admin/shared/adminStyles';
import { toast } from 'react-toastify';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    categoryDescription: '',
    parentCategory: '',
    categoryImage: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'categoryName', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, sortConfig]);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;

      // Add sorting parameters
      if (sortConfig.key && sortConfig.direction) {
        queryParams += `&sort=${sortConfig.key}&order=${sortConfig.direction}`;
      }

      console.log('Fetching categories with params:', queryParams);

      // Use the api instance that automatically handles authentication
      const response = await api.get(`/api/categories?${queryParams}`);

      console.log('Categories response:', response.data);

      // Process categories to fix image URLs and get service counts
      const categoriesWithCounts = await Promise.all(
        response.data.data.map(async (category) => {
          try {
            // Get count of services in this category
            // Use the api instance that automatically handles authentication
            const servicesResponse = await api.get(`/api/listings?category=${category._id}&limit=1`);

            // Fix image URL if needed
            let processedCategory = { ...category };

            // Check if the image URL is relative and needs to be fixed
            if (category.categoryImage && !category.categoryImage.startsWith('http')) {
              // Make sure it's a valid path
              if (category.categoryImage.startsWith('/')) {
                const apiUrl = '';
                processedCategory.categoryImage = `${apiUrl}${category.categoryImage}`;
              } else {
                processedCategory.categoryImage = `${''}/${category.categoryImage}`;
              }
            }

            return {
              ...processedCategory,
              serviceCount: servicesResponse.data.pagination?.total || 0
            };
          } catch (err) {
            console.error(`Error processing category ${category._id}:`, err);
            return { ...category, serviceCount: 0 };
          }
        })
      );

      setCategories(categoriesWithCounts || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in as an admin user.');
          toast.error('Authentication failed. Please log in as an admin user.');
        } else if (err.response.status === 403) {
          setError('Access denied. You must be an administrator to view this data.');
          toast.error('Access denied. You must be an administrator to view this data.');
        } else {
          const errorMessage = err.response.data?.message || 'Failed to load categories. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Failed to load categories. Please try again.');
        toast.error('Failed to load categories');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or GIF)');
        toast.error('Invalid file type');
        e.target.value = null; // Reset the input
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        toast.error('Image too large');
        e.target.value = null; // Reset the input
        return;
      }

      // Set the image in the form data
      setNewCategory({
        ...newCategory,
        [name]: file
      });

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setError(null);
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      });
    }
  };

  // Open modal for adding a new category
  const handleAddCategory = () => {
    setNewCategory({
      categoryName: '',
      categoryDescription: '',
      parentCategory: '',
      categoryImage: null
    });
    setImagePreview('');
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal for editing a category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
      parentCategory: category.parentCategory?._id || '',
      categoryImage: null
    });

    // Set image preview with the full URL
    if (category.categoryImage) {
      // Use the already processed URL from our fetchCategories function
      setImagePreview(category.categoryImage);
    } else {
      setImagePreview('');
    }

    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Open modal for deleting a category
  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('delete');
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setImagePreview('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!newCategory.categoryName || !newCategory.categoryDescription) {
      setError('Category name and description are required');
      toast.error('Please fill in all required fields');
      return;
    }

    // Show loading toast
    const toastId = toast.loading(`${modalMode === 'add' ? 'Creating' : 'Updating'} category...`);

    try {
      let response;

      if (modalMode === 'add') {
        // Create new category first
        response = await api.post(
          '/api/categories',
          {
            categoryName: newCategory.categoryName,
            categoryDescription: newCategory.categoryDescription,
            parentCategory: newCategory.parentCategory || null
          }
        );

        console.log('Category created:', response.data);

        // If we have an image, upload it in a separate request
        if (newCategory.categoryImage) {
          try {
            const categoryId = response.data.data._id;
            const imageFormData = new FormData();
            imageFormData.append('image', newCategory.categoryImage);

            console.log('Uploading image for new category:', categoryId);
            console.log('Image file:', newCategory.categoryImage);

            const imageResponse = await api.put(
              `/api/categories/${categoryId}/image`,
              imageFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            );

            console.log('Category image uploaded successfully:', imageResponse.data);
          } catch (imageError) {
            console.error('Error uploading category image:', imageError);

            // Show warning toast but don't fail the whole operation
            toast.warning('Category was created but image upload failed. You can try again later.');
          }
        }

        // Show success message
        toast.update(toastId, {
          render: 'Category created successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else if (modalMode === 'edit' && selectedCategory) {
        // Update existing category
        response = await api.put(
          `/api/categories/${selectedCategory._id}`,
          {
            categoryName: newCategory.categoryName,
            categoryDescription: newCategory.categoryDescription,
            parentCategory: newCategory.parentCategory || null
          }
        );

        console.log('Category updated:', response.data);

        // If we have a new image, upload it in a separate request
        if (newCategory.categoryImage) {
          try {
            const imageFormData = new FormData();
            imageFormData.append('image', newCategory.categoryImage);

            console.log('Uploading image for category:', selectedCategory._id);
            console.log('Image file:', newCategory.categoryImage);

            const imageResponse = await api.put(
              `/api/categories/${selectedCategory._id}/image`,
              imageFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            );

            console.log('Category image updated successfully:', imageResponse.data);
          } catch (imageError) {
            console.error('Error updating category image:', imageError);

            // Show warning toast but don't fail the whole operation
            toast.warning('Category was updated but image upload failed. You can try again later.');
          }
        }

        // Show success message
        toast.update(toastId, {
          render: 'Category updated successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      }

      // Reset form and close modal
      setNewCategory({
        categoryName: '',
        categoryDescription: '',
        parentCategory: '',
        categoryImage: null
      });
      setIsModalOpen(false);
      setError(null);

      // Refresh the categories list
      setTimeout(() => fetchCategories(), 100);
    } catch (err) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} category:`, err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${modalMode === 'add' ? 'create' : 'update'} category`;
      setError(errorMessage);

      // Update toast to show error
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (!selectedCategory) return;

    // Check if category has services
    if (selectedCategory.serviceCount > 0) {
      setError(`Cannot delete category with ${selectedCategory.serviceCount} services. Remove or reassign services first.`);
      toast.error('Cannot delete category with active services');
      return;
    }

    // Show loading toast
    const toastId = toast.loading('Deleting category...');

    try {
      await api.delete(`/api/categories/${selectedCategory._id}`);

      // Show success message
      toast.update(toastId, {
        render: 'Category deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setIsModalOpen(false);
      setError(null);

      // Refresh the categories list
      setTimeout(() => fetchCategories(), 100);
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete category';
      setError(errorMessage);

      // Update toast to show error
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Category',
      accessor: 'categoryName',
      Cell: (category) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {category.categoryImage && !category.categoryImage.includes('undefined') ? (
              <>
                <img
                  className="h-10 w-10 object-contain"
                  src={category.categoryImage}
                  alt={category.categoryName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                  <div className="text-gray-500 font-semibold text-lg">
                    {category.categoryName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 font-semibold text-lg">
                {category.categoryName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {category.categoryName}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'categoryDescription',
      Cell: (category) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {category.categoryDescription}
        </div>
      )
    },
    {
      header: 'Parent Category',
      accessor: 'parentCategory',
      Cell: (category) => (
        <div className="text-sm text-gray-900">
          {category.parentCategory?.categoryName || 'None'}
        </div>
      )
    },
    {
      header: 'Services',
      accessor: 'serviceCount',
      Cell: (category) => (
        <div className="text-sm text-gray-900">
          {category.serviceCount || 0}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (category) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCategory(category)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <i className="fas fa-edit mr-1 text-indigo-600"></i> Edit
          </button>
          <button
            onClick={() => handleDeleteCategory(category)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <i className="fas fa-trash mr-1 text-red-600"></i> Delete
          </button>
        </div>
      )
    }
  ];

  // Render modal content based on mode
  const renderModalContent = () => {
    switch (modalMode) {
      case 'add':
      case 'edit':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={newCategory.categoryName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="categoryDescription"
                name="categoryDescription"
                value={newCategory.categoryDescription}
                onChange={handleInputChange}
                rows="3"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category (Optional)
              </label>
              <select
                id="parentCategory"
                name="parentCategory"
                value={newCategory.parentCategory}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              >
                <option value="">None</option>
                {categories
                  .filter(cat => !selectedCategory || cat._id !== selectedCategory._id)
                  .map(category => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 mb-1">
                Category Image
              </label>
              <input
                type="file"
                id="categoryImage"
                name="categoryImage"
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <div className="mt-2 flex justify-center">
                    <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{width: '150px', height: '150px'}}>
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="bg-gray-200 flex items-center justify-center text-gray-500 w-full h-full" style={{display: 'none'}}>
                            <span>Preview not available</span>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-200 flex items-center justify-center text-gray-500 w-full h-full">
                          <span>No preview available</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Preview of category image</p>
                </div>
              )}
            </div>
          </form>
        );
      case 'delete':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Category</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete the category "{selectedCategory?.categoryName}"?
              This action cannot be undone.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render modal footer based on mode
  const renderModalFooter = () => {
    switch (modalMode) {
      case 'add':
      case 'edit':
        return (
          <>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={handleSubmit}
            >
              {modalMode === 'add' ? 'Add Category' : 'Update Category'}
            </button>
          </>
        );
      case 'delete':
        return (
          <>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all service categories in the system</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <i className="fas fa-plus mr-2"></i> Add Category
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">

        <Table
          columns={columns}
          data={categories}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No categories found"
        />
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'add' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'Delete Category'}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  </div>
  );
}

export default Categories;