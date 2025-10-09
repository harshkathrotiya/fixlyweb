import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { motion } from "framer-motion";
import Button from "../../components/common/Button";
import api from "../../config/api"; // Import the api instance

function SignUp() {
  // Removed userType state and set a default value in the signup data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // Allow only digits, spaces, dashes, parentheses and plus sign
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/[^0-9]/g, '').length >= 10;
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG)");
        return;
      }

      if (file.size > maxSize) {
        setError("Image size should not exceed 2MB");
        return;
      }

      // Create a preview
      setImagePreview(URL.createObjectURL(file));
      setProfilePicture(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!firstName || !lastName) {
      setError("First name and last name are required.");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid phone number with at least 10 digits.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!street || !city || !state || !zipCode || !country) {
      setError("All address fields are required.");
      setLoading(false);
      return;
    }

    try {
      // Upload profile picture if selected
      let imageUrl = "";
      if (profilePicture) {
        setIsUploading(true);
        try {
          imageUrl = await uploadToCloudinary(profilePicture);
          setProfilePictureUrl(imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          // Don't fail the signup if image upload fails, just continue without the image
          //setError("Failed to upload profile picture. Please try again.");
          //setIsUploading(false);
          //setLoading(false);
          //return;
        }
        setIsUploading(false);
      }

      const signupData = {
        userType: "user", // Hardcoded as "user" since we removed the selection
        password,
        firstName,
        lastName,
        email,
        phone,
        profilePicture: imageUrl, // Add the profile picture URL
        address: {
          street,
          city,
          state,
          zipCode,
          country,
        },
      };

      // Use the api instance instead of fetch
      const response = await api.post("/api/auth/register", signupData);

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("authToken", response.data.token);
        alert("Signup Successful! Please login.");
        navigate("/login");
      } else {
        setError(response.data.message || "Signup Failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      // Provide more specific error messages
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          setError(error.response.data.message || "Invalid input data. Please check your information.");
        } else if (error.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(error.response.data.message || "An error occurred during signup. Please try again.");
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf2f3]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#45573a] px-6 py-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Create Your Account</h2>
            <p className="text-[#ebf2f3] mt-3 text-lg">Join our community of service providers and customers</p>
          </div>

          <div className="px-6 py-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#0b0e11] mb-2">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#0b0e11] mb-2">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0b0e11] mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#0b0e11] mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#0b0e11] mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b0e11] mb-2">Profile Picture</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#babfbc] border-4 border-white shadow-lg flex items-center justify-center">
                        <i className="fas fa-user text-[#0b0e11] text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="profile-image-upload" className="bg-[#45573a] hover:bg-[#0b0e11] text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center shadow-md hover:shadow-lg">
                      <i className="fas fa-camera mr-2"></i> {imagePreview ? "Change Photo" : "Upload Photo"}
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-[#727373] mt-2">JPG, PNG, WEBP up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#babfbc] pt-8">
                <h3 className="text-2xl font-bold text-[#0b0e11] mb-6">Address Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-[#0b0e11] mb-2">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-[#0b0e11] mb-2">City</label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-[#0b0e11] mb-2">State</label>
                      <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-[#0b0e11] mb-2">Zip Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-[#0b0e11] mb-2">Country</label>
                      <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading || isUploading}
                  className="flex-1 py-3 text-lg font-semibold bg-[#45573a] hover:bg-[#0b0e11] text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {loading || isUploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> 
                      {isUploading ? "Uploading..." : "Creating Account..."}
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                
                <Link 
                  to="/login" 
                  className="flex-1 text-center bg-white border-2 border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3] font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center"
                >
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SignUp;