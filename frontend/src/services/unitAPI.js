import api from './API';

export const unitAPI = {
  getAll: () => api.get(`/units`),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post(`/units`, data),
  update: (id, data) => api.post(`/units/${id}`, data),
};
