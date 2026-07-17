import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../api/client';

function formatFecha(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState('');
  const [eliminando, setEliminando] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/visitas');
      setVisitas(data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function eliminarSoloVisita() {
    if (!eliminando) return;
    await api.delete(`/visitas/${eliminando.id}`);
    setEliminando(null);
    cargar();
  }

  async function eliminarAmbos() {
    if (!eliminando) return;
    await api.delete(`/visitas/${eliminando.id}?eliminartambien=persona`);
    setEliminando(null);
    cargar();
  }

  const filtradas = visitas.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.nombres.toLowerCase().includes(q) ||
      v.apellidos.toLowerCase().includes(q) ||
      v.telefono.includes(q) ||
      (v.email && v.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Nuevos</h1>
          <p className="text-ink/50 text-sm">{visitas.length} personas registradas</p>
        </div>
        <button onClick={() => {
          const token = localStorage.getItem('token');
          const API_URL = import.meta.env.VITE_API_URL || 'https://backend-iglesia-3op0.onrender.com';
          fetch(`${API_URL}/api/excel/visitas`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'nuevos.xlsx';
              a.click();
              URL.revokeObjectURL(url);
            });
        }} className="btn-outline !py-2.5 !px-4 text-sm">
          Descargar Excel
        </button>
      </div>

      <input
        className="input max-w-sm mb-6"
        placeholder="Buscar por nombre, celular o correo…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-paper2 text-ink/60 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Celular</th>
              <th className="px-5 py-3 font-medium">Correo</th>
              <th className="px-5 py-3 font-medium">Dirección</th>
              <th className="px-5 py-3 font-medium">Otra iglesia</th>
              <th className="px-5 py-3 font-medium">Llamada</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando && (
              <tr><td colSpan={8} className="px-5 py-6 text-center text-ink/40">Cargando…</td></tr>
            )}
            {!cargando && filtradas.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-6 text-center text-ink/40">No hay registros.</td></tr>
            )}
            {filtradas.map((v) => (
              <tr key={v.id} className="hover:bg-paper2/50">
                <td className="px-5 py-3 font-medium text-ink">{v.nombres} {v.apellidos}</td>
                <td className="px-5 py-3 text-ink/70">{v.telefono}</td>
                <td className="px-5 py-3 text-ink/70">{v.email || '—'}</td>
                <td className="px-5 py-3 text-ink/60 text-xs">{[v.barrio, v.direccion].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    v.asisteOtraIglesia === 'Si' ? 'bg-azul/10 text-azul' : 'bg-ink/5 text-ink/50'
                  }`}>
                    {v.asisteOtraIglesia === 'Si' ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    v.desearLlamada === 'Si' ? 'bg-gold/20 text-ink' : 'bg-ink/5 text-ink/50'
                  }`}>
                    {v.desearLlamada === 'Si' ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink/50 text-xs whitespace-nowrap">{formatFecha(v.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setEliminando(v)} className="text-rojo/70 font-medium hover:text-rojo text-xs">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtradas.some((v) => v.adicional) && (
        <div className="mt-8">
          <h2 className="font-display text-lg text-ink mb-4">Mensajes / Peticiones de oración</h2>
          <div className="space-y-3">
            {filtradas.filter((v) => v.adicional).map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-line p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-ink text-sm">{v.nombres} {v.apellidos}</span>
                  <span className="text-xs text-ink/40">{formatFecha(v.createdAt)}</span>
                </div>
                <p className="text-ink/60 text-sm leading-relaxed">{v.adicional}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {eliminando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEliminando(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <h3 className="font-display text-lg text-ink mb-1">Eliminar visita</h3>
              <p className="text-sm text-ink/60 mb-5">
                ¿Qué deseas eliminar de <strong>{eliminando.nombres} {eliminando.apellidos}</strong>?
              </p>
              <div className="space-y-2">
                <button
                  onClick={eliminarSoloVisita}
                  className="w-full text-left px-4 py-3 rounded-xl border border-line hover:bg-paper2 transition-colors"
                >
                  <p className="text-sm font-medium text-ink">Solo de Nuevos</p>
                  <p className="text-xs text-ink/50">Se mantiene en Miembros si existe</p>
                </button>
                <button
                  onClick={eliminarAmbos}
                  className="w-full text-left px-4 py-3 rounded-xl border border-rojo/30 hover:bg-rojo/5 transition-colors"
                >
                  <p className="text-sm font-medium text-rojo">De Nuevos y de Miembros</p>
                  <p className="text-xs text-rojo/60">Elimina de ambas listas</p>
                </button>
              </div>
              <button
                onClick={() => setEliminando(null)}
                className="w-full mt-3 text-center text-sm text-ink/40 hover:text-ink/60 py-2"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
