import api from '../config/api';

export const providerService = {
  getProviders: async (params = {}) => {
    const response = await api.get('/api/providers', { params });
    return response.data;
  },

  getProviderById: async (id) => {
    const response = await api.get(`/api/providers/${id}`);
    return response.data;
  },

  getProviderListings: async (providerId) => {
    const response = await api.get(`/api/listings/provider/${providerId}`);
    return response.data;
  }
};