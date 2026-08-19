import api from './api';

const MAX_PAGE_SIZE = 100; // backend clamps `size` to 100 (see competition.controller.ts)
const MAX_PAGES = 20; // safety cap: up to 2000 competitions

export const CompetitionService = {
  /**
   * @param {{page?:number, size?:number, q?:string, category?:string, tab?:string, status?:string}} params
   * @returns {Promise<{data:Array, paging:{page:number,size:number,total:number}}>}
   */
  getAll: async (params = {}) => {
    const response = await api.get('/competitions', { params: { page: 1, size: 20, ...params } });
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/competitions', payload);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/competitions/${id}`);
    return response.data.data;
  },

  /**
   * Fetch every matching competition across all pages (the backend caps `size`
   * at 100 per request, so a single request can silently miss items once the
   * collection grows past that).
   */
  getAllUnpaged: async (params = {}) => {
    let page = 1;
    let all = [];
    while (page <= MAX_PAGES) {
      const response = await api.get('/competitions', { params: { ...params, page, size: MAX_PAGE_SIZE } });
      const { data, paging } = response.data.data;
      all = all.concat(data ?? []);
      if (all.length >= (paging?.total ?? 0) || !data || data.length === 0) break;
      page += 1;
    }
    return all;
  },

  /**
   * There is no "mine" endpoint on the backend. Fetch every status and filter
   * client-side by author username (backend returns `author` as the populated
   * username string — see backend/src/modules/competition/responses/competition.response.ts).
   */
  getMine: async (username) => {
    const all = await CompetitionService.getAllUnpaged({ status: 'all' });
    return all.filter((c) => c.author === username);
  },

  approve: async (id) => {
    const response = await api.patch(`/competitions/${id}/approve`);
    return response.data.data;
  },

  reject: async (id, rejectionReason) => {
    const response = await api.patch(`/competitions/${id}/reject`, { rejectionReason });
    return response.data.data;
  },

  getAudit: async (params = {}) => {
    const response = await api.get('/competitions/audit', { params: { page: 1, size: 30, ...params } });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/competitions/stats');
    return response.data.data;
  },
};
