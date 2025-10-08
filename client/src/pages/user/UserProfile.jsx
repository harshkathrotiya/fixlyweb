import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import ChangePasswordModal from '../auth/ChangePassword';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

function UserProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // Get user data from the API using cached client
        const response = await api.getCurrentUser();

        const userData = response.data.data;

        // Extract all necessary information from the user data
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profilePicture: userData.profilePicture || ''
        });

        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [token, navigate, logout]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError('');

        // Show uploading message
        toast.info('Uploading image...');

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        console.log('Image uploaded to Cloudinary:', imageUrl);

        if (!imageUrl) {
          throw new Error('Failed to get image URL from Cloudinary');
        }

        // Update the user profile with the new image URL using our API client
        const response = await api.put(
          '/api/auth/updateprofile',
          { profilePicture: imageUrl } // Only send the profile picture field
        );

        if (response.data.success) {
          // Update the profile state
          setProfile({
            ...profile,
            profilePicture: imageUrl
          });

          // Update the userData in localStorage
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          toast.success('Profile picture updated successfully!');
        } else {
          throw new Error('Failed to update profile picture on server');
        }
      } catch (err) {
        console.error('Profile image upload error:', err);
        toast.error('Failed to update profile picture. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Prepare the update data
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone
      };

      console.log('Sending update data:', updateData);

      // Update the user profile using our API client
      const response = await api.put('/api/auth/updateprofile', updateData);

      console.log('Profile update response:', response.data);

      if (response.data.success) {
        // Update the userData in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...userData, ...updateData };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile on server');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-[#50B498] mb-4"></i>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="md:flex">
                <div className="md:w-1/3 p-6 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                          <i className="fas fa-user text-5xl text-gray-400"></i>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <label 
                          htmlFor="profile-image-upload" 
                          className="bg-[#50B498] text-white p-2 rounded-full cursor-pointer hover:bg-[#468585] transition-colors shadow-md"
                        >
                          <i className="fas fa-camera"></i>
                        </label>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      <div className="bg-[#DEF9C4] rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-[#0b0e11]">
                          <i className="fas fa-user mr-2"></i>
                          <span className="font-medium">User</span>
                        </div>
                      </div>
                      
                      <div className="bg-[#ebf2f3] rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-[#727373]">
                          <i className="fas fa-calendar-alt mr-2"></i>
                          <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => setIsPasswordModalOpen(true)}
                      >
                        <i className="fas fa-lock mr-2"></i> Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 p-6">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Input
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleInputChange}
                        required
                      />

                      <Input
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-2 border border-[#939492] rounded-lg bg-[#babfbc] text-[#0b0e11] cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <Input
                        label="Phone Number"
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center"
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

export default UserProfile;