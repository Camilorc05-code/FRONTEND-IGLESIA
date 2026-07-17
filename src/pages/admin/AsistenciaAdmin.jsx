import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

export default function AsistenciaAdmin() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('hoy');
  const [hoy, setHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const cargarHoy = async () => {
    try {
      const res = await fetch(`${API}/api/checkin/hoy`, { headers });
      if (res.ok) setHoy(await res.json());
    } catch {}
  };

  const cargarHistorial = async (p = 1) => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/checkin/historial?page=${p}&limit=200`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistorial(data.data);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {}
    setCargando(false);
  };

  useEffect(() => {
    cargarHoy();
    cargarHistorial();
  }, []);

  useEffect(() => {
    if (tab === 'hoy') cargarHoy();
    else cargarHistorial();
  }, [tab]);

  if (usuario?.rol !== 'ADMIN' && usuario?.rol !== 'PASTOR') {
    return <div className="p-8 text-center text-gray-500">No tienes acceso a esta sección.</div>;
  }

  const agruparPorFecha = (asistencias) => {
    const grupos = {};
    asistencias.forEach((a) => {
      const fecha = new Date(a.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const fechaKey = new Date(a.fecha).toISOString().slice(0, 10);
      if (!grupos[fechaKey]) grupos[fechaKey] = { label: fecha, items: [] };
      grupos[fechaKey].items.push(a);
    });
    return Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const agruparPorServicio = (asistencias) => {
    const grupos = {};
    asistencias.forEach((a) => {
      const key = a.servicio || 'General';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(a);
    });
    return grupos;
  };

  const irAMiembro = (personaId) => {
    navigate(`/admin/personas?highlight=${personaId}`);
  };

  const eliminarFecha = async (fechaKey, label, cantidad) => {
    const confirmar = window.confirm(
      `¿Eliminar ${cantidad} registros de asistencia del ${label}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setEliminando(fechaKey);
    try {
      const res = await fetch(`${API}/api/checkin/fecha`, {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fechaKey }),
      });
      if (res.ok) {
        setFechaSeleccionada(null);
        cargarHistorial();
      }
    } catch {}
    setEliminando(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Control de Asistencia</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setTab('hoy'); setFechaSeleccionada(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'hoy' ? 'bg-[#0A2A57] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Hoy
          </button>
          <button
            onClick={() => { setTab('historial'); setFechaSeleccionada(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'historial' ? 'bg-[#0A2A57] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Historial
          </button>
        </div>
      </div>

      {tab === 'hoy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {hoy ? (
            <>
              <div className="bg-gradient-to-r from-[#0A2A57] to-[#1B3A6B] rounded-2xl p-6 mb-6 text-white shadow-lg">
                <p className="text-5xl font-bold">{hoy.total}</p>
                <p className="text-blue-200 mt-1">personas registradas hoy</p>
              </div>

              {Object.entries(agruparPorServicio(hoy.asistencias)).map(([servicio, asistencias]) => (
                <div key={servicio} className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#D4A017] rounded-full inline-block"></span>
                    {servicio}
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{asistencias.length}</span>
                  </h3>
                  <div className="bg-white border rounded-xl divide-y shadow-sm">
                    {asistencias.map((a, i) => (
                      <button
                        key={a.id}
                        onClick={() => irAMiembro(a.persona.id)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50 transition-colors text-left"
                      >
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{a.persona.apellidos} {a.persona.nombres}</p>
                          <p className="text-xs text-gray-400">{a.persona.ministerio || 'Sin ministerio'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm text-gray-500 font-mono">{a.hora}</span>
                          <p className="text-[10px] text-gray-300">Ver miembro →</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {hoy.asistencias.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Aún no hay asistencia hoy</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          )}
        </motion.div>
      )}

      {tab === 'historial' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {cargando ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{total} registros en total</p>

              {fechaSeleccionada ? (
                <div>
                  <button
                    onClick={() => setFechaSeleccionada(null)}
                    className="mb-4 text-sm text-[#0A2A57] hover:underline font-medium"
                  >
                    ← Volver al historial
                  </button>
                  <h3 className="font-semibold text-gray-700 mb-3">{fechaSeleccionada.label}</h3>
                  <div className="bg-white border rounded-xl divide-y shadow-sm">
                    {fechaSeleccionada.items.map((a, i) => (
                      <button
                        key={a.id}
                        onClick={() => irAMiembro(a.persona.id)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50 transition-colors text-left"
                      >
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{a.persona.apellidos} {a.persona.nombres}</p>
                          <p className="text-xs text-gray-400">{a.servicio || 'General'} · {a.persona.ministerio || ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm text-gray-500 font-mono">{a.hora}</span>
                          <p className="text-[10px] text-gray-300">Ver miembro →</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {agruparPorFecha(historial).map(([fechaKey, grupo]) => (
                    <div key={fechaKey} className="bg-white border rounded-xl px-5 py-4 hover:border-[#D4A017] hover:shadow-md transition-all flex items-center gap-4">
                      <button
                        onClick={() => setFechaSeleccionada(grupo)}
                        className="flex-1 flex items-center gap-4 text-left"
                      >
                        <div className="w-12 h-12 bg-[#0A2A57] text-white rounded-xl flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold leading-none">{new Date(fechaKey + 'T12:00:00').getDate()}</span>
                          <span className="text-[9px] uppercase leading-none">
                            {new Date(fechaKey + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short' })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800">{grupo.label}</p>
                          <p className="text-sm text-gray-400">{grupo.items.length} personas</p>
                        </div>
                        <span className="text-gray-300 text-lg">→</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminarFecha(fechaKey, grupo.label, grupo.items.length); }}
                        disabled={eliminando === fechaKey}
                        className="shrink-0 text-red-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Eliminar registros de esta fecha"
                      >
                        {eliminando === fechaKey ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                        )}
                      </button>
                    </div>
                  ))}

                  {historial.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-4xl mb-2">📋</p>
                      <p>Sin registros aún</p>
                    </div>
                  )}
                </div>
              )}

              {total > 200 && !fechaSeleccionada && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => cargarHistorial(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200"
                  >
                    ← Anterior
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-500">Página {page}</span>
                  <button
                    onClick={() => cargarHistorial(page + 1)}
                    disabled={historial.length < 200}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
