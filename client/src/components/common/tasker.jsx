import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import Button from './Button';

const Tasker = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    serviceDescription: '',
    serviceCategory: '',
    availability: 'Weekdays',
    accountName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    experience: '',
    qualifications: '',
    certifications: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    api.get('/api/categories')
      .then(res => {
        // Make sure we're accessing the data array from the response
        setCategories(res.data.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories([]); // Set empty array on error
      });
  }, []);

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // Allow only digits, spaces, dashes, parentheses and plus sign
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/[^0-9]/g, '').length >= 10;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        setFormStatus({
          message: "Please upload a valid image file (JPEG, PNG)",
          type: 'error'
        });
        return;
      }

      if (file.size > maxSize) {
        setFormStatus({
          message: "Image size should not exceed 2MB",
          type: 'error'
        });
        return;
      }

      // Create a preview
      setImagePreview(URL.createObjectURL(file));
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ message: '', type: '' });

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setFormStatus({
        message: "First name and last name are required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setFormStatus({
        message: "Please enter a valid phone number with at least 10 digits.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email) {
      setFormStatus({
        message: "Email is required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        message: "Please enter a valid email address.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormStatus({
        message: "Password must be at least 6 characters long.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.serviceCategory) {
      setFormStatus({
        message: "Please select a service category.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.serviceDescription) {
      setFormStatus({
        message: "Service description is required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.experience) {
      setFormStatus({
        message: "Experience is required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.qualifications) {
      setFormStatus({
        message: "Qualifications are required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.certifications) {
      setFormStatus({
        message: "Certifications are required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      setFormStatus({
        message: "All address fields are required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.accountName || !formData.accountNumber || !formData.bankName || !formData.ifscCode) {
      setFormStatus({
        message: "All bank details are required.",
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    // Upload profile picture if selected
    let profilePictureUrl = "";
    if (profilePicture) {
      setIsUploading(true);
      try {
        profilePictureUrl = await uploadToCloudinary(profilePicture);
      } catch (error) {
        console.error("Error uploading image:", error);
        setFormStatus({
          message: "Failed to upload profile picture. Please try again.",
          type: 'error'
        });
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      profilePicture: profilePictureUrl, // Add profile picture URL
      serviceDescription: formData.serviceDescription,
      serviceCategory: [formData.serviceCategory],
      availability: formData.availability,
      bankDetails: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode
      },
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      experience: parseInt(formData.experience), // Convert to integer
      qualifications: formData.qualifications,
      certifications: [formData.certifications]
    };

    try {
      const response = await api.post('/api/providers/register', payload);
      console.log('Registration success:', response.data);
      setFormStatus({
        message: "Registration Successful! You'll be contacted for verification.",
        type: 'success'
      });
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        serviceDescription: '',
        serviceCategory: '',
        availability: 'Weekdays',
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        experience: '',
        qualifications: '',
        certifications: ''
      });
      setImagePreview('');
      setProfilePicture(null);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      setFormStatus({
        message: err.response?.data?.message || "Registration Failed. Please try again.",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#50B498] mb-2">Become a Service Provider</h1>
          <p className="text-gray-600 text-lg">Join our network of professionals and grow your business</p>
        </div>

        {formStatus.message && (
          <div className={`p-4 rounded-md mb-6 text-center ${
            formStatus.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {formStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#50B498] mb-6 pb-2 border-b border-gray-200">Personal Information</h2>

            <div className="flex flex-col items-center mb-6">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-[#50B498]"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex justify-center items-center mb-4 text-[#50B498] text-5xl border-4 border-gray-300">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <div className="relative mt-2">
                <label htmlFor="profile-image-upload" className="bg-[#50B498] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#468585] transition-colors shadow-md">
                  <i className="fas fa-camera mr-2"></i> {imagePreview ? "Change Photo" : "Upload Photo"}
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  onChange={handleProfileImageChange}
                  className="absolute w-0.1 h-0.1 opacity-0 overflow-hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  placeholder="First Name"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Last Name"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="Email"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                placeholder="Phone"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#50B498] mb-6 pb-2 border-b border-gray-200">Service Details</h2>
            <div className="space-y-2 mb-6">
              <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">
                Service Category
              </label>
              <select
                id="serviceCategory"
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 mb-6">
              <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">
                Service Description
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                placeholder="Describe the services you offer"
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Experience (years)
                </label>
                <input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  placeholder="Years of experience"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                >
                  <option value="">Select Availability</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="All Days">All Days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                  Qualifications
                </label>
                <input
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  placeholder="Your qualifications"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                  Certifications
                </label>
                <input
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  placeholder="Relevant certifications"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#50B498] mb-6 pb-2 border-b border-gray-200">Address Information</h2>
            <div className="space-y-2 mb-6">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                id="street"
                name="street"
                value={formData.street}
                placeholder="Street"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  placeholder="City"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  value={formData.state}
                  placeholder="State"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  placeholder="ZIP Code"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  value={formData.country}
                  placeholder="Country"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#50B498] mb-6 pb-2 border-b border-gray-200">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                  Account Holder Name
                </label>
                <input
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  placeholder="Account Name"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  placeholder="Account Number"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  placeholder="Bank Name"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                  IFSC Code
                </label>
                <input
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  placeholder="IFSC Code"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#939492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                </>
              ) : (
                "Register as Service Provider"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tasker;