import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import ChangePasswordModal from '../auth/ChangePassword';

function ProviderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    description: '',
    profilePicture: '',
    verificationStatus: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(!id);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let userData = null;
        let providerData = null;

        if (id) {
          // Fetching another provider's profile
          setIsOwnProfile(false);

          // Get provider data by ID
          try {
            const providerResponse = await api.get(`/api/providers/${id}`);
            console.log('Provider data from API:', providerResponse.data);

            if (providerResponse.data.success) {
              providerData = providerResponse.data.data;
              userData = providerData.userId; // Extract user data from provider

              // Also fetch services by this provider
              try {
                // Use the correct endpoint for fetching services by provider ID
                const servicesResponse = await api.get(`/api/providers/${id}/listings`);
                console.log('Provider services from API:', servicesResponse.data);
                if (servicesResponse.data.success) {
                  setServices(servicesResponse.data.data || []);
                } else {
                  console.warn('Provider services request succeeded but with no data or success=false');
                  setServices([]);
                }
              } catch (servicesErr) {
                console.error('Error fetching provider services:', servicesErr);
                setServices([]); // Set empty array on error
              }
            } else {
              console.warn('Provider profile request succeeded but with no data or success=false');
              setError('Provider not found');
              setLoading(false);
              return;
            }
          } catch (providerErr) {
            console.error('Error fetching provider data:', providerErr);
            setError('Failed to load provider profile');
            setLoading(false);
            return;
          }
        } else {
          // Fetching own profile
          setIsOwnProfile(true);

          // Get fresh user data from the auth endpoint (don't use cached data to ensure we get latest verification status)
          try {
            const userResponse = await api.getCurrentUser();
            
            console.log('Fresh user data from API:', userResponse.data);
            userData = userResponse.data.data || userResponse.data;
            
            // Also get provider profile data
            try {
              const providerResponse = await api.get('/api/providers/me');
              console.log('Provider profile data:', providerResponse.data);
              if (providerResponse.data.success) {
                providerData = providerResponse.data.data;
              } else {
                console.warn('Provider profile request succeeded but with no data or success=false');
                providerData = null;
              }
            } catch (providerErr) {
              console.error('Error fetching provider profile:', providerErr);
              // Check if it's a 404 error (provider profile not found)
              if (providerErr.response?.status === 404) {
                console.log('Provider profile not found - this might be expected for new providers');
                providerData = null;
              } else {
                // For other errors, we still want to show the user profile
                providerData = null;
              }
            }

            // Store the user data in localStorage for persistence
            localStorage.setItem('userData', JSON.stringify(userData));
          } catch (userErr) {
            console.error('Error fetching user data:', userErr);
            if (userErr.response?.status === 401) {
              logout();
              navigate('/login');
            }
            setError('Failed to load profile');
            setLoading(false);
            return;
          }

          // Also fetch own services
          try {
            const servicesResponse = await api.get('/api/providers/me/listings');
            console.log('Own services from API:', servicesResponse.data);
            if (servicesResponse.data.success) {
              setServices(servicesResponse.data.data || []);
            } else {
              console.warn('Services request succeeded but with no data or success=false');
              setServices([]);
            }
          } catch (servicesErr) {
            console.error('Error fetching own services:', servicesErr);
            setServices([]); // Set empty array on error
          }
        }

        // Extract all necessary information from the user data
        if (id && providerData) {
          // For public provider profile
          setProfile({
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            businessName: userData?.businessName || '',
            businessAddress: userData?.address || '',
            description: userData?.description || providerData?.serviceDescription || '',
            profilePicture: userData?.profilePicture || '',
            verificationStatus: providerData?.verificationStatus || 'pending'
          });
        } else if (!id) {
          // For own profile
          // Determine verification status: use provider status if available, otherwise fall back to user status
          let verificationStatus = 'pending';
          if (providerData?.verificationStatus) {
            verificationStatus = providerData.verificationStatus;
          } else if (userData?.isVerified) {
            verificationStatus = 'verified';
          }
          
          setProfile({
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            businessName: userData?.businessName || '',
            businessAddress: userData?.address || '',
            description: userData?.description || providerData?.serviceDescription || '',
            profilePicture: userData?.profilePicture || '',
            verificationStatus: verificationStatus
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, logout, id]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        // Show uploading message
        setSuccessMessage('Uploading image...');

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        console.log('Image uploaded to Cloudinary:', imageUrl);

        if (!imageUrl) {
          throw new Error('Failed to get image URL from Cloudinary');
        }

        // Update the user profile with the new image URL
        const response = await api.put(
          '/api/auth/updateprofile',
          { profilePicture: imageUrl }, // Only send the profile picture field
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Profile update response:', response.data);

        if (response.data.success) {
          // Update local state with the new image URL
          setProfile(prev => ({ ...prev, profilePicture: imageUrl }));

          // Update the profile picture in localStorage to persist across refreshes
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          setSuccessMessage('Profile image updated successfully');
        } else {
          throw new Error('Failed to update profile on server');
        }
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setError('Failed to upload profile image: ' + (err.response?.data?.message || err.message));
        setSuccessMessage('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Prepare the data to send
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        businessName: profile.businessName,
        address: profile.businessAddress,
        description: profile.description
      };

      // Update the user profile
      const response = await api.put('/api/auth/updateprofile', updateData);

      if (response.data.success) {
        // Update local state
        setProfile(prev => ({ ...prev, ...updateData }));

        // Update the profile in localStorage to persist across refreshes
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        Object.assign(userData, updateData);
        localStorage.setItem('userData', JSON.stringify(userData));

        setSuccessMessage('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifyAccount = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Send verification request
      const response = await api.post('/api/providers/request-verification');

      if (response.data.success) {
        // Update local state
        setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
        setSuccessMessage('Verification request submitted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to submit verification request');
      }
    } catch (err) {
      console.error('Failed to submit verification request:', err);
      setError('Failed to submit verification request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const VerificationBadge = () => {
    const status = profile.verificationStatus?.toLowerCase();
    
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <i className="fas fa-check-circle mr-1"></i>
          Verified
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <i className="fas fa-clock mr-1"></i>
          Pending Verification
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <i className="fas fa-exclamation-circle mr-1"></i> Not Verified
        </span>
      );
    }
  };

  if (loading && !profile.firstName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-400 to-purple-400 px-6 py-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white p-1">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <i className="fas fa-user text-3xl"></i>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50">
                  <i className="fas fa-camera text-gray-600"></i>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={loading}
                  />
                </label>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-purple-100">{profile.email}</p>
            <div className="mt-2 flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                (profile.verificationStatus || '').toLowerCase() === 'verified' 
                  ? 'bg-green-100 text-green-800' 
                  : (profile.verificationStatus || '').toLowerCase() === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {(profile.verificationStatus || '').toLowerCase() === 'verified' ? (
                  <>
                    <i className="fas fa-check-circle mr-1"></i> Verified
                  </>
                ) : (profile.verificationStatus || '').toLowerCase() === 'pending' ? (
                  <>
                    <i className="fas fa-clock mr-1"></i> Pending Verification
                  </>
                ) : (
                  <>
                    <i className="fas fa-exclamation-circle mr-1"></i> Not Verified
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loader"></div>
            </div>
          ) : error ? (
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
          ) : (
            <>
              {successMessage && (
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-green-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.businessName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Address</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.businessAddress || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {profile.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <i className="fas fa-key mr-2"></i> Change Password
                  </button>
                </div>
              )}

              {/* Services Section - REMOVED as per user request */}
            </>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProviderProfile;