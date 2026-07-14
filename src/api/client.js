import axios from 'axios';

// Configura VITE_API_URL en tu .env — ver .env.example
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-iglesia-3op0.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Adjunta el token JWT (si existe) a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, cierra sesión automáticamente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);
