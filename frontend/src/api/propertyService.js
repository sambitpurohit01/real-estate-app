import api from './axios';

export const propertyService = {
  search: (params) => api.get('/api/properties', { params }).then((res) => res.data),
  getById: (id) => api.get(`/api/properties/${id}`).then((res) => res.data),
  myListings: () => api.get('/api/properties/my-listings').then((res) => res.data),
  create: (data) => api.post('/api/properties', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/properties/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/api/properties/${id}`),
};

export const favoriteService = {
  list: () => api.get('/api/favorites').then((res) => res.data),
  add: (propertyId) => api.post(`/api/favorites/${propertyId}`),
  remove: (propertyId) => api.delete(`/api/favorites/${propertyId}`),
};

export const fileService = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (evt) => onProgress(Math.round((evt.loaded * 100) / evt.total))
          : undefined,
      })
      .then((res) => res.data.url);
  },
};

export const inquiryService = {
  create: (data) => api.post('/api/inquiries', data).then((res) => res.data),
  received: () => api.get('/api/inquiries/received').then((res) => res.data),
  markRead: (id) => api.patch(`/api/inquiries/${id}/read`),
};

export const reviewService = {
  list: (propertyId) => api.get(`/api/reviews/property/${propertyId}`).then((res) => res.data),
  summary: (propertyId) => api.get(`/api/reviews/property/${propertyId}/summary`).then((res) => res.data),
  create: (propertyId, data) => api.post(`/api/reviews/property/${propertyId}`, data).then((res) => res.data),
};
