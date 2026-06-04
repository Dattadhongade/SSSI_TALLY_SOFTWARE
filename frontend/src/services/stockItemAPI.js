import api from './API';

export const stockItemAPI = {
  getAll: () => api.get(`/stockitems`),
  getById: (id) => api.get(`/stockitems/${id}`),
  create: (data) => api.post(`/stockitems`, data),
  update: (id, data) => api.post(`/stockitems/${id}`, data),
};
