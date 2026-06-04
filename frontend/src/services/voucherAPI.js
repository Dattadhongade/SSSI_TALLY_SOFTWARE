import api from './API';

export const voucherAPI = {
  getAll: () => api.get(`/vouchers`),
  getById: (id) => api.get(`/vouchers/${id}`),
  create: (data) => api.post(`/vouchers`, data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
  getTypes: () => api.get(`/vouchers/types`),
};
