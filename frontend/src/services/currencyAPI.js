import api from './API';

export const currencyAPI = {
  getAll: () => api.get(`/currencies`),
  getById: (id) => api.get(`/currencies/${id}`),
  create: (data) => api.post(`/currencies`, data),
  update: (id, data) => api.post(`/currencies/${id}`, data),
};
