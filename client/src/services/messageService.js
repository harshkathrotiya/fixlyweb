import api from '../config/api';

export const messageService = {
  getMessagesByBooking: async (bookingId) => {
    const response = await api.get(`/api/messages/booking/${bookingId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/api/messages/${messageId}/read`);
    return response.data;
  }
};