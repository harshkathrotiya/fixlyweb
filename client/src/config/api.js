import axios from 'axios';

// Use relative URLs for API calls in development (with proxy) and environment variable in production
const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

// Cache for API responses
const apiCache = {
  userProfile: null,
  userProfileTimestamp: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10 second timeout
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle specific HTTP errors
    switch (error.response.status) {
      case 401:
        // Unauthorized - token might be expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        break;
      case 500:
        console.error('Server error:', error.response.data);
        break;
      default:
        console.error('API error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API methods with caching
const enhancedApi = {
  ...api,

  // Get current user profile with caching
  async getCurrentUser() {
    const now = Date.now();
    const cacheValid = apiCache.userProfileTimestamp &&
                      (now - apiCache.userProfileTimestamp < apiCache.cacheDuration);

    // Return cached data if valid
    if (cacheValid && apiCache.userProfile) {
      console.log('Using cached user profile');
      return { data: apiCache.userProfile };
    }

    try {
      // Fetch fresh data
      const response = await api.get('/api/auth/me');

      // Update cache
      apiCache.userProfile = response.data;
      apiCache.userProfileTimestamp = now;

      return response;
    } catch (error) {
      // Clear cache on error
      apiCache.userProfile = null;
      apiCache.userProfileTimestamp = null;
      throw error;
    }
  },

  // Clear user cache (useful for logout)
  clearUserCache() {
    apiCache.userProfile = null;
    apiCache.userProfileTimestamp = null;
  }
};

export default enhancedApi;