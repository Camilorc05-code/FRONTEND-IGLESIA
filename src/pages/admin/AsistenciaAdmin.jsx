import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

export default function AsistenciaAdmin() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState('hoy');
  const [hoy, setHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const cargarHoy = async () => {
    try {
      const res = await fetch(`${API}/api/checkin/hoy`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHoy(data);
      }
    } catch {}
  };

  const cargarHistorial = async (p = 1) => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/checkin/historial?page=${p}&limit=30`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistorial(data.data);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {
      setError('Error al cargar historial.');
    }
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
    return (
      <div className="p-8 text-center text-gray-500">
        No tienes acceso a esta sección.
      </div>
    );
  }

  const agruparPorServicio = (asistencias) => {
    const grupos = {};
    asistencias.forEach((a) => {
      const key = a.servicio || 'Sin servicio';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(a);
    });
    return grupos;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Asistencia</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('hoy')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'hoy' ? 'bg-[#0A2A57] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Hoy
        </button>
        <button
          onClick={() => setTab('historial')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'historial' ? 'bg-[#0A2A57] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Historial
        </button>
      </div>

      {tab === 'hoy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {hoy ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold text-[#0A2A57]">{hoy.total}</p>
                <p className="text-sm text-gray-600">personas registradas hoy</p>
              </div>

              {Object.entries(agruparPorServicio(hoy.asistencias)).map(([servicio, asistencias]) => (
                <div key={servicio} className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{servicio}</h3>
                  <div className="bg-white border rounded-xl divide-y">
                    {asistencias.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{i + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{a.persona.apellidos} {a.persona.nombres}</p>
                          <p className="text-xs text-gray-400">{a.persona.ministerio || 'Sin ministerio'}</p>
                        </div>
                        <span className="text-xs text-gray-400">{a.hora}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {hoy.asistencias.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aún no hay asistencia hoy.</p>
              )}
            </>
          ) : (
            <p className="text-gray-400">Cargando...</p>
          )}
        </motion.div>
      )}

      {tab === 'historial' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {cargando ? (
            <p className="text-gray-400">Cargando...</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">{total} registros en total</p>

              <div className="bg-white border rounded-xl divide-y">
                {historial.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{a.persona.apellidos} {a.persona.nombres}</p>
                      <p className="text-xs text-gray-400">
                        {a.servicio || 'Sin servicio'} · {a.hora}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(a.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>

              {total > 30 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => cargarHistorial(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-500">Página {page}</span>
                  <button
                    onClick={() => cargarHistorial(page + 1)}
                    disabled={historial.length < 30}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm disabled:opacity-40"
                  >
                    Siguiente →
                  </button>
                </div>
              )}

              {historial.length === 0 && (
                <p className="text-gray-400 text-center py-8">Sin registros aún.</p>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
