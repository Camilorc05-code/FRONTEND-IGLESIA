import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logoMision from '../assets/logo-mision-transparente.png';
import NotificationBell from './NotificationBell';

const allItems = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/personas', label: 'Miembros' },
  { to: '/admin/citas', label: 'Citas' },
  { to: '/admin/visitas', label: 'Nuevos' },
  { to: '/admin/bebes', label: 'Bebés' },
  { to: '/admin/servicios', label: 'Horarios', roles: ['ADMIN'] },
  { to: '/admin/eventos', label: 'Eventos', roles: ['ADMIN'] },
  { to: '/admin/usuarios', label: 'Usuarios', roles: ['ADMIN'] },
  { to: '/admin/asistencia', label: 'Asistencia', roles: ['ADMIN', 'PASTOR'] },
  { to: '/admin/historial', label: 'Historial', roles: ['ADMIN'] },
  { to: '/admin/seguridad', label: 'Seguridad' },
];

export function RutaProtegida({ children }) {
  const { usuario } = useAuth();
  const token = localStorage.getItem('token');
  if (!usuario || !token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();

  const items = useMemo(() => {
    if (!usuario) return allItems;
    return allItems.filter((it) => !it.roles || it.roles.includes(usuario.rol));
  }, [usuario]);

  // Cierra el menú móvil automáticamente al cambiar de sección
  useEffect(() => setAbierto(false), [location.pathname]);

  // Scroll al inicio al cambiar de sección
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-paper2 flex flex-col md:flex-row">
      {/* Barra superior — solo visible en móvil/tablet */}
      <header className="md:hidden sticky top-0 z-40 bg-ink text-paper" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14 shrink-0">
          <div className="flex items-center gap-3">
            <img src={logoMision} alt="Misión Panamericana" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-display text-base leading-tight">Panel interno</p>
              <p className="text-[11px] text-paper/50">{usuario?.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={logout}
              className="text-paper/50 hover:text-paper text-xs px-2 py-1"
            >
              Salir
            </button>
            <button
              onClick={() => setAbierto((o) => !o)}
              aria-label="Abrir menú del panel"
              aria-expanded={abierto}
              className="p-2 -mr-2"
            >
              <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" animate={{ rotate: abierto ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </motion.svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menú desplegable móvil */}
      <AnimatePresence>
        {abierto && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-ink text-paper overflow-hidden shrink-0"
          >
            <div className="px-3 pb-3 space-y-1">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-gold text-ink' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-paper/60 hover:bg-paper/10 hover:text-paper"
              >
                Cerrar sesión
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Sidebar fijo — solo desde tablet/desktop */}
      <aside className="hidden md:flex w-60 bg-ink text-paper flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-paper/10">
          <div className="flex items-center gap-3 mb-3">
            <img src={logoMision} alt="Misión Panamericana" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-display text-sm leading-tight font-semibold">Misión Panamericana</p>
              <p className="text-[10px] text-gold italic">Centro de Fe y Esperanza</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-paper/70">{usuario?.nombre}</p>
              <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wide bg-gold text-ink px-2 py-0.5 rounded">
                {usuario?.rol}
              </span>
            </div>
            <NotificationBell />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-gold text-ink' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-paper/10">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-paper/60 hover:bg-paper/10 hover:text-paper"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
