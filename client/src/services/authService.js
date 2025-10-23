import api from '../config/api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  getCurrentUser: async () => {
    const response = await api.getCurrentUser();
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/updateprofile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/api/auth/changepassword', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  }
};