import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function ChangePasswordModal({ isOpen, onClose }) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token, login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!passwords.currentPassword) {
      toast.error('Current password is required');
      return false;
    }

    if (!passwords.newPassword) {
      toast.error('New password is required');
      return false;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.put(
        '/api/auth/updatepassword',
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);

        // Clear form
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Update the token if a new one is returned
        if (response.data.token) {
          // Update the auth context with the new token
          localStorage.setItem('authToken', response.data.token);

          // If user data is returned, update that too
          if (response.data.data) {
            login(response.data.data, response.data.token);
          }
        }

        toast.success('Password updated successfully!');

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password update error:', err);
      if (err.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-gradient-to-r from-[#50B498] to-[#468585] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Change Password</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-[#ebf2f3] hover:text-white rounded-full hover:bg-[#468585] transition-colors duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {success ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Password updated successfully!</p>
                  <p className="text-sm text-gray-500">Your password has been changed.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      className="flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className="fas fa-exclamation-circle mr-3"></i>
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400"></i>
                        </div>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwords.currentPassword}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-[#939492] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498] disabled:bg-[#babfbc] disabled:text-gray-500 transition-all duration-300 bg-[#ebf2f3]"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-key text-gray-400"></i>
                        </div>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwords.newPassword}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          minLength={6}
                          className="block w-full pl-10 pr-3 py-3 border border-[#939492] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498] disabled:bg-[#babfbc] disabled:text-gray-500 transition-all duration-300 bg-[#ebf2f3]"
                          placeholder="Enter new password"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-shield-alt text-gray-400"></i>
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwords.confirmPassword}
                          onChange={handleChange}
                          disabled={loading}
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-[#939492] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-[#50B498] disabled:bg-[#babfbc] disabled:text-gray-500 transition-all duration-300 bg-[#ebf2f3]"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-[#939492] rounded-xl shadow-sm text-sm font-medium text-[#0b0e11] bg-[#ebf2f3] hover:bg-[#babfbc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#50B498] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#50B498] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ChangePasswordModal;