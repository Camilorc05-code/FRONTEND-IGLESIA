import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';

export default function Alertas() {
  const [tab, setTab] = useState('inasistencia');
  const [inasistentes, setInasistentes] = useState([]);
  const [cumpleanos, setCumpleanos] = useState({ hoy: [], proximos: [] });
  const [cargando, setCargando] = useState(true);
  const [exito, setExito] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  async function cargarDatos() {
    setCargando(true);
    try {
      if (tab === 'inasistencia') {
        const { data } = await api.get('/alertas/inasistencia');
        setInasistentes(data);
      } else {
        const { data } = await api.get('/alertas/cumpleanos');
        setCumpleanos(data);
      }
    } catch {} finally { setCargando(false); }
  }

  async function notificarCumple(personaId) {
    try {
      await api.post('/alertas/cumpleanos/enviar-notificacion', { personaId });
      setExito('Notificación enviada.');
      setTimeout(() => setExito(''), 3000);
    } catch {}
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Alertas</h1>
        <p className="text-ink/50 text-sm mb-6">Inasistencia y cumpleaños de miembros</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('inasistencia')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'inasistencia' ? 'bg-azul text-white' : 'bg-white border border-line text-ink/60 hover:bg-paper2'}`}>
            ⚠️ Inasistencia ({inasistentes.length})
          </button>
          <button onClick={() => setTab('cumpleanos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cumpleanos' ? 'bg-azul text-white' : 'bg-white border border-line text-ink/60 hover:bg-paper2'}`}>
            🎂 Cumpleaños ({cumpleanos.hoy.length + cumpleanos.proximos.length})
          </button>
        </div>

        {exito && <p className="text-verde text-sm mb-4">{exito}</p>}

        {/* Inasistencia */}
        {tab === 'inasistencia' && (
          <div className="space-y-3">
            {cargando ? (
              <div className="bg-white rounded-xl border border-line p-8 text-center text-ink/40">Cargando…</div>
            ) : inasistentes.length === 0 ? (
              <div className="bg-white rounded-xl border border-line p-8 text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-ink/50">Todos los miembros están asistiendo regularmente.</p>
              </div>
            ) : (
              inasistentes.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rojo/10 flex items-center justify-center text-rojo text-sm font-bold">
                        {p.nombres[0]}{p.apellidos[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-ink/40">
                          Última asistencia: {p.ultimaAsistencia} · {p.domingosSinAsistir} domingos sin asistir
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.telefono && <p className="text-xs text-ink/40">📱 {p.telefono}</p>}
                      <p className="text-xs text-rojo font-medium mt-1">⚠️ Requiere visita pastoral</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Cumpleaños */}
        {tab === 'cumpleanos' && (
          <div className="space-y-4">
            {cargando ? (
              <div className="bg-white rounded-xl border border-line p-8 text-center text-ink/40">Cargando…</div>
            ) : (
              <>
                {/* Cumpleañeros de hoy */}
                {cumpleanos.hoy.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink mb-3">🎉 Hoy cumple años</h3>
                    {cumpleanos.hoy.map((p) => (
                      <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-ink text-lg font-bold">
                              🎂
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{p.nombres} {p.apellidos}</p>
                              <p className="text-sm text-ink/60">¡Feliz cumpleaños!</p>
                            </div>
                          </div>
                          <button onClick={() => notificarCumple(p.id)} className="btn-gold text-xs">Notificar</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Próximos cumpleaños */}
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-3">Próximos cumpleaños</h3>
                  {cumpleanos.proximos.length === 0 ? (
                    <div className="bg-white rounded-xl border border-line p-6 text-center text-ink/40">
                      No hay cumpleaños próximos este mes.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cumpleanos.proximos.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border border-line p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-azul/10 flex items-center justify-center text-azul text-xs font-bold">
                              {p.diaCumple}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink">{p.nombres} {p.apellidos}</p>
                              <p className="text-xs text-ink/40">{p.diaCumple} de {p.mesCumple}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {p.telefono && <p className="text-xs text-ink/40">📱 {p.telefono}</p>}
                            <p className="text-xs text-azul font-medium mt-1">En {p.diasHasta} día{p.diasHasta !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
