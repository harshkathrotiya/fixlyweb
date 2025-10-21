import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import ChangePasswordModal from '../auth/ChangePassword';

function AdminProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});

      const response = await api.getCurrentUser();
      const userData = response.data.data;

      const profileData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        profilePicture: userData.profilePicture || ''
      };

      setProfile(profileData);
      setOriginalProfile(profileData);
      setIsDirty(false);

    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setNotification({
        type: 'error',
        message: 'Failed to load profile. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if form has been modified
  useEffect(() => {
    if (Object.keys(originalProfile).length > 0) {
      const formChanged =
        profile.firstName !== originalProfile.firstName ||
        profile.lastName !== originalProfile.lastName ||
        profile.phone !== originalProfile.phone;

      setIsDirty(formChanged);
    }
  }, [profile, originalProfile]);

  // Form field validation
  const validateForm = () => {
    const newErrors = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profile.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profile.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]{10,15}$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setImageLoading(true);
        setErrors({});

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG)');
        }

        if (file.size > maxSize) {
          throw new Error('Image size should not exceed 5MB');
        }

        setNotification({ type: 'info', message: 'Uploading image...' });

        const imageUrl = await uploadToCloudinary(file);

        if (!imageUrl) {
          throw new Error('Failed to upload image. Please try again.');
        }

        const response = await api.put('/api/auth/updateprofile', { profilePicture: imageUrl });

        if (response.data.success) {
          setProfile(prev => ({
            ...prev,
            profilePicture: imageUrl
          }));

          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          setNotification({
            type: 'success',
            message: 'Profile image updated successfully!'
          });

          setTimeout(() => {
            setNotification({ type: '', message: '' });
          }, 3000);
        } else {
          throw new Error(response.data.message || 'Failed to update profile image');
        }
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setNotification({
          type: 'error',
          message: err.message || 'Failed to upload profile image'
        });
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaveLoading(true);
      setErrors({});
      setNotification({ type: 'info', message: 'Saving changes...' });

      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profilePicture: profile.profilePicture
      };

      const response = await api.put('/api/auth/updateprofile', updateData);

      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...userData, ...updateData };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setNotification({
          type: 'success',
          message: 'Profile updated successfully!'
        });

        setOriginalProfile(profile);
        setIsDirty(false);

        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update profile'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      navigate('/admin');
    }
  };

  const confirmCancel = () => {
    setShowConfirmDialog(false);
    navigate('/admin');
  };

  const dismissConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  // Loading skeleton
  if (loading && !profile.firstName) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto lg:mx-0"></div>
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto lg:mx-0"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto lg:mx-0"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto lg:mx-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and account settings
            </p>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification.message && (
              <motion.div
                className={`mb-6 rounded-lg p-4 shadow-sm border-l-4 ${
                  notification.type === 'success' 
                    ? 'bg-green-50 border-green-400' 
                    : notification.type === 'error' 
                    ? 'bg-red-50 border-red-400'
                    : 'bg-purple-50 border-purple-400'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`text-lg mr-3 ${
                      notification.type === 'success' ? 'text-green-600' :
                      notification.type === 'error' ? 'text-red-600' : 'text-purple-600'
                    }`}>
                      {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
                      {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                      {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
                    </div>
                    <p className={`font-medium ${
                      notification.type === 'success' ? 'text-green-800' :
                      notification.type === 'error' ? 'text-red-800' : 'text-purple-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    className={`hover:opacity-70 transition-opacity ${
                      notification.type === 'success' ? 'text-green-600' :
                      notification.type === 'error' ? 'text-red-600' : 'text-purple-600'
                    }`}
                    onClick={() => setNotification({ type: '', message: '' })}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header Section */}
              <div className="bg-purple-400 px-8 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                  {/* Profile Picture */}
                  <div className="relative">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                    
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className={`w-32 h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-lg text-white ${
                        profile.profilePicture ? 'hidden' : 'flex'
                      }`}
                    >
                      <span className="text-3xl font-semibold">
                        {profile.firstName && profile.lastName ?
                          `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` :
                          <i className="fas fa-user text-2xl"></i>}
                      </span>
                    </div>

                    {/* Change Photo Button */}
                    <label 
                      htmlFor="profile-image-upload" 
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg border-2 border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    >
                      <i className="fas fa-camera text-gray-600"></i>
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      disabled={imageLoading}
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="text-center lg:text-left text-white">
                    <h2 className="text-3xl font-bold">
                      {profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Admin User'}
                    </h2>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Administrator
                    </div>
                    <div className="mt-4 space-y-2 text-purple-100">
                      <div className="flex items-center justify-center lg:justify-start">
                        <i className="fas fa-envelope mr-3"></i>
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center justify-center lg:justify-start">
                          <i className="fas fa-phone mr-3"></i>
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <i className="fas fa-user-circle mr-3 text-purple-600"></i>
                      Personal Information
                    </h3>
                  </div>

                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                          errors.firstName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                          errors.lastName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-gray-400"></i>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <i className="fas fa-lock mr-1"></i>
                      Email address cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-phone text-gray-400"></i>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                          errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone ? (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.phone}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        Format: +1 (555) 123-4567
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <i className="fas fa-key mr-1.5 text-purple-600 text-xs"></i>
                    Change Password
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-200 space-y-4 sm:space-y-0 sm:space-x-4">
                  {isDirty && (
                    <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      <span className="text-sm font-medium">You have unsaved changes</span>
                    </div>
                  )}
                  
                  <div className={`flex space-x-4 ${!isDirty ? 'ml-auto' : ''}`}>
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded-lg shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                      onClick={handleCancel}
                      disabled={saveLoading}
                    >
                      <i className="fas fa-times mr-1.5 text-xs"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex items-center px-2.5 py-1 border border-transparent rounded-lg shadow-sm text-xs font-medium text-white transition-all duration-200 ${
                        saveLoading || !isDirty
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:shadow-lg'
                      }`}
                      disabled={saveLoading || !isDirty}
                    >
                      {saveLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-1.5 text-xs"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <motion.div
                  className="bg-white rounded-xl shadow-xl max-w-md w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Discard Changes?
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        You have unsaved changes that will be lost. Are you sure you want to leave this page?
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button 
                        className="inline-flex items-center justify-center px-2.5 py-1 border border-gray-300 rounded-lg shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" 
                        onClick={dismissConfirmDialog}
                      >
                        <i className="fas fa-arrow-left mr-1.5 text-xs"></i>
                        Continue Editing
                      </button>
                      <button 
                        className="inline-flex items-center justify-center px-2.5 py-1 border border-transparent rounded-lg shadow-sm text-xs font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200" 
                        onClick={confirmCancel}
                      >
                        <i className="fas fa-trash mr-1.5 text-xs"></i>
                        Discard Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Change Password Modal */}
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
          />
        </div>
      </div>
  );
}

export default AdminProfile;