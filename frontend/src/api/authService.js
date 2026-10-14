import api from './axios';

export const authService = {
  register: (data) => api.post('/api/auth/register', data).then((res) => res.data),
  login: (data) => api.post('/api/auth/login', data).then((res) => res.data),
  me: () => api.get('/api/users/me').then((res) => res.data),
  updateProfile: (data) => api.put('/api/users/me', data).then((res) => res.data),
};
