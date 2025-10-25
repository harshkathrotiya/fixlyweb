import api from '../config/api';

export const listingService = {
  getListings: async (params = {}) => {
    const response = await api.get('/api/listings', { params });
    return response.data;
  },

  getListingById: async (id) => {
    const response = await api.get(`/api/listings/${id}`);
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  },

  updateListing: async (id, listingData) => {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  },

  getProviderListings: async (providerId) => {
    const response = await api.get(`/api/listings/provider/${providerId}`);
    return response.data;
  },

  searchListings: async (query) => {
    const response = await api.get('/api/listings/search', { params: { q: query } });
    return response.data;
  }
};