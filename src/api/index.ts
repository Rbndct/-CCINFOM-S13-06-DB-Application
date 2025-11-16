import axios from 'axios';

// Function to get the API port
// Priority: 1. VITE_API_PORT env var, 2. port.txt file (backend
// auto-assigned), 3. localStorage, 4. default 3001
async function getApiPort() {
  // Check environment variable (Vite uses import.meta.env)
  const envPort = import.meta.env.VITE_API_PORT;
  if (envPort) {
    return parseInt(envPort, 10);
  }

  // Try to read port from backend's logs/port.txt file (if backend
  // auto-assigned a port) Note: This requires backend to serve the file, which
  // may not be available We'll rely on detectBackendPort() instead

  // Check localStorage for previously detected port
  const storedPort = localStorage.getItem('api_port');
  if (storedPort) {
    return parseInt(storedPort, 10);
  }

  // Default fallback
  return 3001;
}

// Helper function to validate if a response is from the backend API (JSON, not HTML)
function isValidBackendResponse(response: any): boolean {
  if (!response || !response.data) {
    return false;
  }
  
  // Check if response is HTML (indicates frontend dev server)
  const contentType = response.headers?.['content-type'] || '';
  if (contentType.includes('text/html')) {
    return false;
  }
  
  // Check if data is an object (JSON response)
  if (typeof response.data === 'object' && response.data !== null) {
    // Backend endpoints return JSON objects with specific structure
    // /test returns { message, timestamp, port }
    // /port returns { port }
    // /health returns { status, database }
    return true;
  }
  
  // If data is a string, check if it's HTML
  if (typeof response.data === 'string') {
    return !response.data.trim().startsWith('<!doctype html>') && 
           !response.data.trim().startsWith('<!DOCTYPE html>');
  }
  
  return false;
}

// Function to detect the backend port by trying to connect
// This handles auto-assigned ports from the backend (when PORT=0 or port is in
// use)
async function detectBackendPort() {
  // Prioritize port 3001 (default backend port), exclude 8080 (common Vite dev server port)
  const commonPorts = [3001, 3000, 3002, 3067, 5000];
  const storedPort = localStorage.getItem('api_port');

  // Try stored port first if available (but validate it's not 8080)
  if (storedPort) {
    const port = parseInt(storedPort, 10);
    // Skip stored port if it's 8080 (likely the frontend dev server)
    if (port !== 8080) {
      try {
        // Try /test endpoint to validate it's the backend
        const response = await axios.get(`http://localhost:${port}/test`, {
          timeout: 2000,
          validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx
        });
        
        if (isValidBackendResponse(response) && response.data && typeof response.data === 'object') {
          const detectedPort = response.data.port || port;
          localStorage.setItem('api_port', detectedPort.toString());
          updateApiPort(detectedPort);
          return detectedPort;
        }
      } catch (e) {
        // Stored port doesn't work, try others
        console.warn(`Stored port ${port} is not valid, trying other ports...`);
      }
    } else {
      // Clear invalid stored port (8080)
      localStorage.removeItem('api_port');
    }
  }

  // Try common ports (backend may have auto-assigned a different port)
  for (const port of commonPorts) {
    try {
      // Try /test endpoint to validate it's the backend
      const response = await axios.get(`http://localhost:${port}/test`, {
        timeout: 2000,
        validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx
      });
      
      // Validate response is JSON (backend) and not HTML (frontend dev server)
      if (isValidBackendResponse(response) && response.data && typeof response.data === 'object') {
        const detectedPort = response.data.port || port;
        localStorage.setItem('api_port', detectedPort.toString());
        updateApiPort(detectedPort);
        console.log(`✅ Detected backend API on port ${detectedPort}`);
        return detectedPort;
      }
    } catch (e) {
      // Continue to next port
    }
  }

  // Return default if nothing works
  console.warn('⚠️ Could not detect backend port, using default 3001');
  return 3001;
}

// Get initial port (default to 3001, will be updated async)
let currentPort = 3001;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `http://localhost:${currentPort}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clear invalid stored ports (like 8080 which is the frontend dev server)
function clearInvalidStoredPort() {
  const storedPort = localStorage.getItem('api_port');
  if (storedPort) {
    const port = parseInt(storedPort, 10);
    // Clear port 8080 (common Vite dev server port)
    if (port === 8080) {
      localStorage.removeItem('api_port');
      console.log('🧹 Cleared invalid stored port 8080 (frontend dev server)');
    }
  }
}

// Initialize port asynchronously
(async () => {
  try {
    // Clear any invalid stored ports first
    clearInvalidStoredPort();
    
    const port = await getApiPort();
    // Don't use port 8080 even if it's in localStorage or env
    if (port && port !== 8080 && port !== currentPort) {
      updateApiPort(port);
    } else if (port === 8080) {
      console.warn('⚠️ Port 8080 detected (frontend dev server), using default 3001 for backend');
    }
  } catch (e) {
    console.warn('Could not get initial API port, using default:', e);
  }
})();

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
      // Validate response is from backend (not HTML from frontend dev server)
      if (!isValidBackendResponse(response)) {
        console.error('❌ Received HTML response instead of JSON. Wrong port detected!');
        // Try to detect correct backend port
        detectBackendPort()
            .then(port => {
              if (port !== currentPort) {
                updateApiPort(port);
                console.log('🔄 Retrying with correct backend port...');
              }
            })
            .catch(() => {
              console.error('⚠️ Could not detect correct backend port');
            });
        // Reject with a clear error
        return Promise.reject(new Error('Invalid response: received HTML instead of JSON. Backend may be on wrong port.'));
      }
      
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
        // Check if error response is HTML (wrong port)
        const contentType = error.response.headers?.['content-type'] || '';
        if (contentType.includes('text/html')) {
          console.error('❌ Backend API error: Received HTML response. Wrong port detected!');
          // Try to detect correct backend port
          detectBackendPort()
              .then(port => {
                if (port !== currentPort) {
                  updateApiPort(port);
                  console.log('🔄 Retrying with correct backend port...');
                }
              })
              .catch(() => {
                console.error('⚠️ Could not detect correct backend port');
              });
          return Promise.reject(new Error('Backend API not found. Received HTML instead of JSON.'));
        }
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        // Network error - might be wrong port, try to detect
        console.warn('⚠️ Network Error:', error.message);
        // Only try to detect port if we're not already on the default
        if (currentPort !== 3001) {
          detectBackendPort()
              .then(port => {
                if (port !== currentPort) {
                  updateApiPort(port);
                  console.log('🔄 Detected different backend port, retrying...');
                }
              })
              .catch(() => {
                // Could not detect, keep current port
                console.warn('⚠️ Could not detect backend port, keeping current port');
              });
        }
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
  getByWedding: (weddingId) =>
      api.get('/guests', {params: {wedding_id: weddingId}}),
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
  createGuestTable: (weddingId, capacity, table_category = 'guest') => api.post(
      `/tables/seating/${weddingId}/guest`, {capacity, table_category}),
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
  removeFromTable: (tableId, packageId) =>
      api.delete(`/packages/assign/${tableId}/${packageId}`),
  getTableAssignments: (weddingId) =>
      api.get(`/packages/wedding/${weddingId}/assignments`),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', {params}),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const inventoryAllocationAPI = {
  getAllByWedding: (weddingId) => api.get(`/inventory/allocations/${weddingId}`),
  create: (data) => api.post('/inventory/allocations', data),
  update: (allocationId, data) => api.put(`/inventory/allocations/${allocationId}`, data),
  delete: (allocationId) => api.delete(`/inventory/allocations/${allocationId}`),
};

export const ingredientsAPI = {
  getAll: () => api.get('/ingredients'),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  restock: (id, delta) => api.put(`/ingredients/${id}/restock`, { delta }),
  delete: (id) => api.delete(`/ingredients/${id}`),
};

export default api;
