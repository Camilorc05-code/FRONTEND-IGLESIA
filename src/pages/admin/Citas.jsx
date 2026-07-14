import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'];
const ESTILO_ESTADO = {
  PENDIENTE: 'bg-gold/20 text-gold-dark',
  CONFIRMADA: 'bg-azul/15 text-azul',
  COMPLETADA: 'bg-ink/10 text-ink/60',
  CANCELADA: 'bg-rojo/15 text-rojo',
};

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/citas', {
        params: filtroEstado ? { estado: filtroEstado } : {},
      });
      setCitas(data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  async function cambiarEstado(id, estado) {
    await api.put(`/citas/${id}/estado`, { estado });
    cargar();
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta cita definitivamente?')) return;
    await api.delete(`/citas/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Citas pastorales</h1>
          <p className="text-ink/50 text-sm">Solicitudes hechas desde la página pública</p>
        </div>
        <select className="input max-w-[200px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {cargando && <p className="text-ink/40">Cargando…</p>}
        {!cargando && citas.length === 0 && <p className="text-ink/40">No hay citas para mostrar.</p>}

        {citas.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-line p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-display text-lg text-ink">{c.nombreSolicitante}</h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${ESTILO_ESTADO[c.estado]}`}>
                  {c.estado}
                </span>
              </div>
              <p className="text-sm text-ink/60 mt-1">
                📞 {c.telefonoSolicitante} {c.emailSolicitante && `· ${c.emailSolicitante}`}
              </p>
              <p className="text-sm text-ink/60">
                Con <strong className="text-ink">{c.pastor?.nombre}</strong> ·{' '}
                {new Date(c.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} ·{' '}
                <span className="font-mono">{c.hora}</span>
              </p>
              {c.motivo && <p className="text-sm text-ink/50 mt-1 italic">"{c.motivo}"</p>}
            </div>

            <div className="flex gap-2 shrink-0">
              {c.estado === 'PENDIENTE' && (
                <button onClick={() => cambiarEstado(c.id, 'CONFIRMADA')} className="btn-outline !py-1.5 !px-3 text-xs">
                  Confirmar
                </button>
              )}
              {c.estado === 'CONFIRMADA' && (
                <button onClick={() => cambiarEstado(c.id, 'COMPLETADA')} className="btn-outline !py-1.5 !px-3 text-xs">
                  Marcar completada
                </button>
              )}
              {c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA' && (
                <button onClick={() => cambiarEstado(c.id, 'CANCELADA')} className="btn-ghost !py-1.5 !px-3 text-xs text-rojo">
                  Cancelar
                </button>
              )}
              <button onClick={() => eliminar(c.id)} className="btn-ghost !py-1.5 !px-3 text-xs">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
