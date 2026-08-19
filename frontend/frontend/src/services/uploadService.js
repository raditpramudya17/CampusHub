import api from './api';

export const UploadService = {
  uploadPoster: async (file) => {
    const formData = new FormData();
    formData.append('poster', file);
    // let the browser set the multipart boundary itself — override the instance's
    // default 'application/json' Content-Type by clearing it for this request only
    const response = await api.post('/uploads/poster', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.data.url;
  },
};
