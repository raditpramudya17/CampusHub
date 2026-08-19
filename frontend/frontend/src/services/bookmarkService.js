import api from './api';

export const BookmarkService = {
  getMine: async () => {
    const response = await api.get('/bookmarks');
    return response.data.data ?? [];
  },

  save: async (competitionId) => {
    const response = await api.post(`/bookmarks/${competitionId}`);
    return response.data;
  },

  remove: async (competitionId) => {
    const response = await api.delete(`/bookmarks/${competitionId}`);
    return response.data;
  },
};
