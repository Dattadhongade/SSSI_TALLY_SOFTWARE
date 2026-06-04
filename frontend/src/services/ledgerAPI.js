import api from './API';

export const ledgerAPI = {
  getAll: () => api.get(`/ledgers`),
  getById: (id) => api.get(`/ledgers/${id}`),
  create: (data) => api.post(`/ledgers`, data),
  update: (id, data) => api.post(`/ledgers/${id}`, data),
};
