import api from './api';

export const ChatService = {
  /** Daftar model yang benar-benar tersedia di server Ollama kampus (lihat backend GET /chat/models). */
  getModels: async () => {
    const response = await api.get('/chat/models');
    return response.data.data ?? [];
  },

  send: async (model, prompt) => {
    const response = await api.post('/chat', { model, prompt, stream: false });
    const data = response.data?.data;
    if (!data) return 'Tidak ada respons.';
    if (typeof data === 'string') return data;
    if (data.response) return String(data.response);
    if (data.reply) return String(data.reply);
    if (Array.isArray(data.output)) return data.output.map((o) => o?.content ?? o).join('\n');
    if (Array.isArray(data.choices) && data.choices[0]) {
      return data.choices[0].message?.content ?? JSON.stringify(data.choices[0]);
    }
    return JSON.stringify(data);
  },
};
