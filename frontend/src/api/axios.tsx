import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/',
});

// Attach DRF Token auth header if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
