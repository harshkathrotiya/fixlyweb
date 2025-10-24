import api from '../config/api';

export const bookingService = {
  getBookings: async (params = {}) => {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/api/bookings/${id}/status`, { status });
    return response.data;
  },

  getProviderBookings: async () => {
    const response = await api.get('/api/bookings/provider');
    return response.data;
  },

  getCustomerBookings: async () => {
    const response = await api.get('/api/bookings/customer');
    return response.data;
  }
};