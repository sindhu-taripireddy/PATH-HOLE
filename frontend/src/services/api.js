import axios from 'axios';

export const getHostName = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return '127.0.0.1';
};

export const getBackendBase = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('potholeguard_api_url');
    if (saved) return saved.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  const host = getHostName();
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://${host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

const api = axios.create({
  baseURL: `${getBackendBase()}/api`,
  timeout: 30000,
});

// Interceptor to attach dynamic baseURL and JWT auth token
api.interceptors.request.use((config) => {
  config.baseURL = `${getBackendBase()}/api`;
  const token = localStorage.getItem('potholeguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to auto-retry on 127.0.0.1 / localhost DNS fallback if Network Error occurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.message === 'Network Error' && config && !config._retry) {
      config._retry = true;
      const currentHost = getHostName();
      const fallbackHost = currentHost === 'localhost' ? '127.0.0.1' : 'localhost';
      
      if (config.baseURL) {
        config.baseURL = config.baseURL.replace(currentHost, fallbackHost);
      }
      if (config.url && config.url.includes(currentHost)) {
        config.url = config.url.replace(currentHost, fallbackHost);
      }
      return api(config);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  signin: (credentials) => api.post('/auth/signin', credentials),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const detectionAPI = {
  uploadImage: (formData) => api.post('/detection/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadVideo: (formData) => api.post('/detection/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  detectFrame: (base64Image) => api.post('/detection/frame', { image_base64: base64Image }),
  getHistory: (params) => api.get('/detection/history', { params }),
  getDetail: (id) => api.get(`/detection/${id}`),
  deleteDetection: (id) => api.delete(`/detection/${id}`),
};

export const mapAPI = {
  getMarkers: (severity) => api.get('/map/potholes', { params: { severity } }),
  getLocationStats: () => api.get('/map/location-stats'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role?role=${role}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSystemStats: () => api.get('/admin/system-stats'),
  retrainModel: (retrainData) => api.post('/admin/retrain', retrainData),
};

export const reportAPI = {
  downloadPDF: (detectionId) => api.get(`/reports/export-pdf/${detectionId}`, {
    responseType: 'blob'
  }),
};

export const getUploadUrl = (filepath) => {
  if (!filepath) return '';
  if (filepath.startsWith('http')) return filepath;
  const filename = filepath.split(/[/\\]/).pop();
  return `${getBackendBase()}/uploads/${filename}`;
};

export default api;
