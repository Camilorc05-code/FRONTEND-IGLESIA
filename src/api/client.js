import axios from 'axios';

// Configura VITE_API_URL en tu .env — ver .env.example
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-iglesia-3op0.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Adjunta el token JWT (si existe) a cada petición
api.interceptors.request.use((config) => {
  // No enviar token en login ni OTP
  const url = config.url || '';
  if (url.includes('/auth/login') || url.includes('/otp/')) {
    return config;
  }
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
    const url = err.config?.url || '';
    const hasToken = localStorage.getItem('token');
    // Solo cerrar sesión si hay token Y no es login ni OTP
    if (err.response?.status === 401 && hasToken && !url.includes('/auth/login') && !url.includes('/otp/') && !url.includes('/citas/auto-recordatorios')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);
