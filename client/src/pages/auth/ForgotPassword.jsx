import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      // Set a longer timeout for the request
      const res = await api.post('/api/auth/forgotpassword', { email }, {
        timeout: 30000 // 30 seconds timeout
      });

      if (res.data.success) {
        setSuccess(true);
        setError('');
      } else {
        setError(res.data.message || 'Failed to process your request');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle timeout specifically
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (err.response?.status === 500) {
        setError('Email service is currently unavailable. Please try again later.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to process your request. Please try again later.');
      }
      setSuccess(false);
    } finally {
      setLoading(false);
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
            <div className="bg-[#45573c] px-6 py-10 text-center">
              <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
              <p className="text-[#ebf2f3] mt-2">Enter your email to receive a password reset link</p>
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

              {success ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                    <div>
                      <p className="text-green-700 font-medium">Password reset link has been sent to your email</p>
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
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-[#0b0e11] mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-[#939492]"></i>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-lg font-semibold bg-[#45573a] hover:bg-[#0b0e11] text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-[#727373]">
                      Remember your password?{' '}
                      <Link to="/login" className="text-[#45573a] hover:text-[#0b0e11] font-medium transition-colors">
                        Login
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPassword;