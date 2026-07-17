import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { registrarPush, verificarPush } from '../lib/push';

const ICONOS = {
  nuevo_miembro: '👤',
  nueva_cita: '📅',
  recordatorio: '🔔',
  sistema: '⚙️',
};

export default function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [pushActivo, setPushActivo] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [posicion, setPosicion] = useState({ top: 0, right: 16 });
  const ref = useRef(null);

  async function cargar() {
    try {
      const [notifs, count] = await Promise.all([
        api.get('/notificaciones'),
        api.get('/notificaciones/no-leidas'),
      ]);
      setNotificaciones(notifs.data);
      setNoLeidas(count.data.count);
    } catch {}
  }

  async function checkPush() {
    const activo = await verificarPush();
    setPushActivo(activo);
  }

  useEffect(() => {
    cargar();
    checkPush();
    const interval = setInterval(cargar, 30000);
    const pushInterval = setInterval(checkPush, 60000);
    return () => { clearInterval(interval); clearInterval(pushInterval); };
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    if (abierto) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [abierto]);

  function toggle() {
    if (!abierto && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosicion({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setAbierto(!abierto);
  }

  async function activarPush() {
    setRegistrando(true);
    const result = await registrarPush();
    setPushActivo(result.ok);
    setRegistrando(false);
  }

  async function marcarLeida(id) {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function marcarTodas() {
    try {
      await api.put('/notificaciones/leer-todas');
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <svg className="w-5 h-5 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-rojo text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', top: posicion.top, right: posicion.right, zIndex: 9999 }}
            className="w-80 bg-white rounded-xl shadow-2xl border border-line overflow-hidden"
          >
            {!pushActivo && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                <p className="text-xs text-amber-700 mb-2">
                  Las notificaciones push no están activas. Actívalas para recibirlas fuera de la página.
                </p>
                <button
                  onClick={activarPush}
                  disabled={registrando}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {registrando ? 'Activando...' : 'Activar notificaciones'}
                </button>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <h3 className="font-display text-sm text-ink">Notificaciones</h3>
              {noLeidas > 0 && (
                <button onClick={marcarTodas} className="text-[11px] text-azul hover:underline">
                  Marcar todas leídas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificaciones.length === 0 && (
                <p className="text-center text-ink/40 text-sm py-8">Sin notificaciones</p>
              )}
              {notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { marcarLeida(n.id); }}
                  className={`w-full text-left px-4 py-3 border-b border-line/50 hover:bg-paper2/50 transition-colors ${
                    !n.leida ? 'bg-azul/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{ICONOS[n.tipo] || '📌'}</span>
                    <div className="min-w-0">
                      <p className={`text-sm leading-tight ${!n.leida ? 'font-semibold text-ink' : 'text-ink/70'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-ink/50 mt-0.5 truncate">{n.mensaje}</p>
                      <p className="text-[10px] text-ink/30 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.leida && (
                      <span className="w-2 h-2 rounded-full bg-azul shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
