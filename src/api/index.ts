import axios from 'axios';

// Function to get the API port
// Priority: 1. VITE_API_PORT env var, 2. port.txt file (backend auto-assigned), 3. localStorage, 4. default 3001
async function getApiPort() {
  // Check environment variable (Vite uses import.meta.env)
  const envPort = import.meta.env.VITE_API_PORT;
  if (envPort) {
    return parseInt(envPort, 10);
  }

  // Try to read port from backend's logs/port.txt file (if backend auto-assigned a port)
  try {
    const portResponse = await fetch('/api/port.txt');
    if (portResponse.ok) {
      const portText = await portResponse.text();
      const port = parseInt(portText.trim(), 10);
      if (!isNaN(port) && port > 0) {
        localStorage.setItem('api_port', port.toString());
        return port;
      }
    }
  } catch (e) {
    // Ignore errors reading port file
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
// This handles auto-assigned ports from the backend (when PORT=0 or port is in use)
async function detectBackendPort() {
  const commonPorts = [3001, 3000, 3002, 3067, 8080, 5000];
  const storedPort = localStorage.getItem('api_port');

  // Try stored port first if available
  if (storedPort) {
    const port = parseInt(storedPort, 10);
    try {
      // Try /port endpoint first (faster, returns just the port)
      const portResponse = await axios.get(`http://localhost:${port}/port`, {timeout: 2000});
      if (portResponse.data && portResponse.data.port) {
        const detectedPort = portResponse.data.port;
        localStorage.setItem('api_port', detectedPort.toString());
        updateApiPort(detectedPort);
        return detectedPort;
      }
      // Fallback to /test endpoint
      const response = await axios.get(`http://localhost:${port}/test`, {timeout: 2000});
      if (response.data && response.data.port) {
        const detectedPort = response.data.port;
        localStorage.setItem('api_port', detectedPort.toString());
        updateApiPort(detectedPort);
        return detectedPort;
      }
      return port;
    } catch (e) {
      // Stored port doesn't work, try others
    }
  }

  // Try common ports (backend may have auto-assigned a different port)
  for (const port of commonPorts) {
    try {
      // Try /port endpoint first (faster)
      const portResponse = await axios.get(`http://localhost:${port}/port`, {timeout: 2000});
      if (portResponse.data && portResponse.data.port) {
        const detectedPort = portResponse.data.port;
        localStorage.setItem('api_port', detectedPort.toString());
        updateApiPort(detectedPort);
        return detectedPort;
      }
      // Fallback to /test endpoint
      const response = await axios.get(`http://localhost:${port}/test`, {timeout: 2000});
      if (response.data) {
        const detectedPort = response.data.port || port;
        localStorage.setItem('api_port', detectedPort.toString());
        updateApiPort(detectedPort);
        return detectedPort;
      }
    } catch (e) {
      // Continue to next port
    }
  }

  // Return default if nothing works
  return 3001;
}

// Get initial port - use default 3001 immediately, will be updated async
let currentPort = 3001;

// Create axios instance with base configuration
// Ensure currentPort has a default value to avoid invalid URL
const api = axios.create({
  baseURL: `http://localhost:${currentPort}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize port asynchronously
getApiPort().then(port => {
  if (port && port !== currentPort) {
    currentPort = port;
    api.defaults.baseURL = `http://localhost:${port}`;
  }
}).catch(() => {
  // Keep default port 3001
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
  getAll: (params) => api.get('/guests', {params}),
  getById: (id) => api.get(`/guests/${id}`),
  getByWedding: (weddingId) => api.get('/guests', {params: {wedding_id: weddingId}}),
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
  createCoupleTable: (weddingId, data = {}) =>
      api.post(`/tables/seating/${weddingId}/couple`, data),
  createGuestTable: (weddingId, capacity, table_category = 'guest') =>
      api.post(`/tables/seating/${weddingId}/guest`, {capacity, table_category}),
  assignGuests: (weddingId, tableId, guestIds) => api.post(
      `/tables/seating/${weddingId}/guest/${tableId}/assign`,
      {guest_ids: guestIds}),
  updateTable: (tableId, data) => api.put(`/tables/seating/${tableId}`, data),
  deleteTable: (tableId) => api.delete(`/tables/seating/${tableId}`),
};

export const menuItemsAPI = {
  getAll: (params) => api.get('/menu-items', {params}),
  getById: (id) => api.get(`/menu-items/${id}`),
  create: (data) => api.post('/menu-items', data),
  update: (id, data) => api.put(`/menu-items/${id}`, data),
  delete: (id) => api.delete(`/menu-items/${id}`),
};

export const packagesAPI = {
  getAll: (params) => api.get('/packages', {params}),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
  assignToTable: (data) => api.post('/packages/assign', data),
  removeFromTable: (tableId, packageId) => api.delete(`/packages/assign/${tableId}/${packageId}`),
  getTableAssignments: (weddingId) => api.get(`/packages/wedding/${weddingId}/assignments`),
};

export default api;
