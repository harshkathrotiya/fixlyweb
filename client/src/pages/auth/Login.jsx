import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import { motion } from "framer-motion";
import Button from "../../components/common/Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;

        localStorage.setItem('authToken', token);

        // Fetch user details from /api/auth/me
        const userResponse = await api.get("/api/auth/me");

        const userData = userResponse.data.data || {};

        // Login will return false if user is inactive
        const loginSuccess = login(userData, token);

        if (!loginSuccess) {
          setError("Your account has been deactivated. Please contact support.");
          setLoading(false);
          return;
        }

        // Updated userType check
        if (userData.userType && userData.userType.toLowerCase() === 'admin') {
          navigate('/admin');
        } else if (userData.userType === 'service_provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      // Handle inactive account error specifically
      if (err.response?.status === 401 && err.response?.data?.message?.includes('deactivated')) {
        setError("Your account has been deactivated. Please contact support.");
      } else {
        setError(err.response?.data?.message || "An error occurred during login");
      }

      // Clear any stored token if login fails
      localStorage.removeItem('authToken');
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
            <div className="bg-[#45573a] px-6 py-8 text-center">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-[#ebf2f3] mt-2">Sign in to your account</p>
            </div>
            
            <div className="px-6 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0b0e11] mb-2">
                    Email Address
                  </label>
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
                      className="w-full pl-10 pr-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-[#0b0e11]">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-[#45573a] hover:text-[#0b0e11] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-[#939492]"></i>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 bg-[#ebf2f3]"
                      placeholder="••••••••"
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
                      <i className="fas fa-spinner fa-spin mr-2"></i> Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[#727373]">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="font-medium text-[#45573a] hover:text-[#0b0e11] transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;