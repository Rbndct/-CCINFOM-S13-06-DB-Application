import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
      // You can add auth tokens here if needed
      // const token = localStorage.getItem('token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    });

// Response interceptor
api.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      // Handle errors globally
      if (error.response) {
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        console.error('Network Error:', error.message);
      } else {
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    });

// API methods
export const guestsAPI = {
  getAll: () => api.get('/guests'),
  getById: (id) => api.get(`/guests/${id}`),
  create: (data) => api.post('/guests', data),
  update: (id, data) => api.put(`/guests/${id}`, data),
  delete: (id) => api.delete(`/guests/${id}`),
};

export const weddingsAPI = {
  getAll: (params) => api.get('/weddings', {params}),
  getById: (id) => api.get(`/weddings/${id}`),
  create: (data) => api.post('/weddings', data),
  update: (id, data) => api.put(`/weddings/${id}`, data),
  delete: (id) => api.delete(`/weddings/${id}`),
};

export const couplesAPI = {
  getAll: (params) => api.get('/couples', {params}),
  getById: (id) => api.get(`/couples/${id}`),
  getWeddings: (id) => api.get(`/couples/${id}/weddings`),
  create: (data) => api.post('/couples', data),
  update: (id, data) => api.put(`/couples/${id}`, data),
  delete: (id) => api.delete(`/couples/${id}`),
  createPreference: (data) => api.post('/couples/preferences', data),
  updatePreference: (id, data) => api.put(`/couples/preferences/${id}`, data),
  deletePreference: (id) => api.delete(`/couples/preferences/${id}`),
  getPreferences: (coupleId) => api.get(`/couples/preferences/${coupleId}`),
};

export const dietaryRestrictionsAPI = {
  getAll: () => api.get('/dietary-restrictions'),
  getById: (id) => api.get(`/dietary-restrictions/${id}`),
  create: (data) => api.post('/dietary-restrictions', data),
  update: (id, data) => api.put(`/dietary-restrictions/${id}`, data),
  delete: (id) => api.delete(`/dietary-restrictions/${id}`),
};

export const testAPI = {
  checkConnection: () => api.get('/test'),
  healthCheck: () => api.get('/health'),
};

export const tablesAPI = {
  getSeating: (weddingId) => api.get(`/tables/seating/${weddingId}`),
  createCoupleTable: (weddingId) =>
      api.post(`/tables/seating/${weddingId}/couple`),
  createGuestTable: (weddingId, capacity) =>
      api.post(`/tables/seating/${weddingId}/guest`, {capacity}),
  assignGuests: (weddingId, tableId, guestIds) => api.post(
      `/tables/seating/${weddingId}/guest/${tableId}/assign`,
      {guest_ids: guestIds}),
  deleteTable: (tableId) => api.delete(`/tables/seating/${tableId}`),
};

export default api;
