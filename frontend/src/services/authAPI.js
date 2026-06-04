import api from './API';

export const authAPI = {
  login: (data) => api.post(`/auth/login`, data),
  register: (data) => api.post(`/auth/register`, data),
};
