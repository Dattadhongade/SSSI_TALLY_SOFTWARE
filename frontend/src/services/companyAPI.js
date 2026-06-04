import api from './API';

export const companyAPI = {
  getAll: () => api.get(`/companies`),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post(`/companies`, data),
  update: (id, data) => api.post(`/companies/${id}`, data),
  updateGst: (id, data) => api.put(`/companies/${id}/gst`, data),
};
