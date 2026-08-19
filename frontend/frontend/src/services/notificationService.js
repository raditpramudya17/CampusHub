import api from './api';

export const NotificationService = {
  getMine: async (params = {}) => {
    const response = await api.get('/notifications', { params: { page: 1, size: 20, ...params } });
    return response.data.data; // { data, paging, unreadCount }
  },

  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },
};
