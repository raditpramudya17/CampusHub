import api from './api';

export const UserService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateMe: async (payload) => {
    const response = await api.patch('/users/me', payload);
    return response.data.data;
  },

  updatePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await api.patch('/users/me/password', { oldPassword, newPassword, confirmPassword });
    return response.data;
  },

  getByUsername: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data.data;
  },

  updateRole: async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params: { page: 1, size: 50, ...params } });
    return response.data.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/users/leaderboard');
    return response.data.data ?? [];
  },
};
