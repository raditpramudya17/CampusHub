import api from './api';

export const AchievementService = {
  getAll: async (params = {}) => {
    const response = await api.get('/achievements', { params: { page: 1, size: 30, ...params } });
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/achievements', payload);
    return response.data.data;
  },

  approve: async (id) => {
    const response = await api.patch(`/achievements/${id}/approve`);
    return response.data.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await api.patch(`/achievements/${id}/reject`, { rejectionReason });
    return response.data.data;
  },
};
