import axios from 'axios';

// Function to get the API port
// Priority: 1. VITE_API_PORT env var, 2. localStorage, 3. default 3001
function getApiPort() {
  // Check environment variable (Vite uses import.meta.env)
  const envPort = import.meta.env.VITE_API_PORT;
  if (envPort) {
    return parseInt(envPort, 10);
  }

  // Check localStorage for previously detected port
  const storedPort = localStorage.getItem('api_port');
  if (storedPort) {
    return parseInt(storedPort, 10);
  }

  // Default fallback
  return 3001;
}

// Function to detect the backend port by trying to connect
async function detectBackendPort() {
  const commonPorts = [3001, 3000, 3002, 3067, 8080, 5000];
  const storedPort = localStorage.getItem('api_port');

  // Try stored port first if available
  if (storedPort) {
    const port = parseInt(storedPort, 10);
    try {
      const response =
          await axios.get(`http://localhost:${port}/test`, {timeout: 2000});
      if (response.data && response.data.port) {
        // Update with the actual port from the response
        localStorage.setItem('api_port', response.data.port.toString());
        return response.data.port;
      }
      return port;
    } catch (e) {
      // Stored port doesn't work, try others
    }
  }

  // Try common ports
  for (const port of commonPorts) {
    try {
      const response =
          await axios.get(`http://localhost:${port}/test`, {timeout: 2000});
      if (response.data) {
        const detectedPort = response.data.port || port;
        localStorage.setItem('api_port', detectedPort.toString());
        return detectedPort;
      }
    } catch (e) {
      // Continue to next port
    }
  }

  // Return default if nothing works
  return 3001;
}

// Get initial port
let currentPort = getApiPort();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `http://localhost:${currentPort}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update the API base URL
export function updateApiPort(port) {
  currentPort = port;
  api.defaults.baseURL = `http://localhost:${port}`;
  localStorage.setItem('api_port', port.toString());
  console.log(`🔗 Updated API base URL to port ${port}`);
}

// Auto-detect port on initialization
detectBackendPort()
    .then(port => {
      if (port !== currentPort) {
        updateApiPort(port);
      }
    })
    .catch(() => {
      console.warn(
          `⚠️ Could not auto-detect backend port, using ${currentPort}`);
    });

// Response interceptor to update port if backend returns it
api.interceptors.response.use(
    (response) => {
      // If the response includes a port, update our stored port
      if (response.data && response.data.port &&
          response.data.port !== currentPort) {
        updateApiPort(response.data.port);
      }
      return response.data;
    },
    (error) => {
      // Handle errors globally
      if (error.response) {
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        // Network error - might be wrong port, try to detect
        console.error('Network Error:', error.message);
        detectBackendPort()
            .then(port => {
              if (port !== currentPort) {
                updateApiPort(port);
              }
            })
            .catch(
                () => {
                    // Could not detect, keep current port
                });
      } else {
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
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
