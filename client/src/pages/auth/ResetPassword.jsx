import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../config/api';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Log the token when component mounts
  useEffect(() => {
    console.log('Reset password component mounted with token:', token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put(`/api/auth/resetpassword/${token}`, {
        password: newPassword
      });

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf2f3]">

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#45573a] px-6 py-10 text-center">
              <h2 className="text-3xl font-bold text-white">Reset Your Password</h2>
              <p className="text-[#ebf2f3] mt-2">Enter your new password below</p>
            </div>
            
            <div className="px-6 py-8">
              {isSubmitted ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                    <div>
                      <p className="text-green-700 font-medium">Your password has been successfully reset!</p>
                      <div className="mt-4">
                        <Link 
                          to="/login" 
                          className="text-[#45573a] hover:text-[#0b0e11] font-medium flex items-center transition-colors"
                        >
                          <i className="fas fa-arrow-left mr-2"></i> Return to Login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                      <div className="flex items-center">
                        <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-[#0b0e11] mb-2">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-[#939492]"></i>
                        </div>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full pl-10 pr-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0b0e11] mb-2">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-[#939492]"></i>
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full pl-10 pr-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 text-lg font-semibold bg-[#45573a] hover:bg-[#0b0e11] text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-[#727373]">
                      Remember your password?{' '}
                      <Link to="/login" className="text-[#45573a] hover:text-[#0b0e11] font-medium transition-colors">
                        Login
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ResetPassword;