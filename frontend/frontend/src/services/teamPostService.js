import api from './api';

export const TeamPostService = {
  getAll: async (params = {}) => {
    const response = await api.get('/teamposts', { params: { page: 1, size: 30, ...params } });
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/teamposts', payload);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/teamposts/${id}`);
    return response.data.data;
  },

  /** value: 1 (naik) atau -1 (turun). Kirim ulang value yang sama untuk membatalkan vote. */
  vote: async (id, value) => {
    const response = await api.post(`/teamposts/${id}/vote`, { value });
    return response.data.data; // { score, myVote }
  },

  getComments: async (teamPostId) => {
    const response = await api.get(`/teamposts/${teamPostId}/comments`, { params: { page: 1, size: 50 } });
    return response.data.data;
  },

  addComment: async (teamPostId, text) => {
    const response = await api.post(`/teamposts/${teamPostId}/comments`, { text });
    return response.data.data;
  },

  removeComment: async (commentId) => {
    const response = await api.delete(`/teamposts/comments/${commentId}`);
    return response.data.data;
  },
};
