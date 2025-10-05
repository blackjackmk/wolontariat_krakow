import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/',
});

// Attach DRF Token auth header if present,
// but skip for auth endpoints (login/register)
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthEndpoint = url.includes('auth/login') || url.includes('auth/register');
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

// On 401 invalid token, clear local token for a clean state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail || error?.response?.data?.error;
    if (status === 401 && typeof detail === 'string' && detail.toLowerCase().includes('token')) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
