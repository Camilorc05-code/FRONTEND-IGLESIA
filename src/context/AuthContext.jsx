import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { registrarPush, verificarPush, desuscribirPush } from '../lib/push';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (usuario) {
      registrarPush().catch(() => {});
    }
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });

    // Si requiere 2FA, no guardamos token aún
    if (data.requires2FA) {
      return { requires2FA: true, tempToken: data.tempToken, usuario: data.usuario };
    }

    // Login normal sin 2FA
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    registrarPush().catch(() => {});
    return data.usuario;
  }

  async function complete2FALogin(fullToken, usuarioData) {
    localStorage.setItem('token', fullToken);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    setUsuario(usuarioData);
    registrarPush().catch(() => {});
  }

  function logout() {
    desuscribirPush();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, complete2FALogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
