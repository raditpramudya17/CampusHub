import api from './api';

export const CommentService = {
  getByCompetition: async (competitionId) => {
    const response = await api.get('/comments', { params: { competitionId, size: 100 } });
    return response.data.data;
  },

  create: async (competitionId, text) => {
    const response = await api.post('/comments', { competitionId, text });
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data.data;
  },
};
