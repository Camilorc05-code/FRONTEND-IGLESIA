import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const ACCIONES = {
  CREATE: { label: 'Creó', color: 'bg-verde/10 text-verde' },
  UPDATE: { label: 'Editó', color: 'bg-azul/10 text-azul' },
  DELETE: { label: 'Eliminó', color: 'bg-rojo/10 text-rojo' },
};

const ENTIDADES = {
  Persona: '👤 Miembro',
  Visita: '📋 Visitante',
  Cita: '📅 Cita',
  Evento: '🎉 Evento',
  Servicio: '⛪ Horario',
  PresentacionBebe: '👶 Bebé',
  Usuario: '🔑 Usuario',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);

  async function cargar(p = 1) {
    setCargando(true);
    try {
      const { data } = await api.get('/audit', { params: { page: p, limit: 30 } });
      setLogs(data.data);
      setTotal(data.total);
      setPage(p);
    } catch {} finally {
      setCargando(false);
    }
  }

  async function eliminarTodo() {
    if (!window.confirm('¿Seguro quieres eliminar todo el historial de cambios? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete('/audit');
      setLogs([]);
      setTotal(0);
    } catch {}
  }

  useEffect(() => { cargar(); }, []);

  const totalPaginas = Math.ceil(total / 30);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Historial de Cambios</h1>
          <p className="text-ink/50 text-sm">{total} registros</p>
        </div>
        {total > 0 && (
          <button
            onClick={eliminarTodo}
            className="text-xs text-rojo border border-rojo/30 rounded-lg px-3 py-2 hover:bg-rojo/5 transition-colors"
          >
            Eliminar historial
          </button>
        )}
      </div>

      {cargando && <p className="text-ink/40">Cargando…</p>}

      {!cargando && logs.length === 0 && (
        <p className="text-ink/40">No hay registros de actividad.</p>
      )}

      {!cargando && logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-line overflow-hidden">
          <div className="divide-y divide-line">
            {logs.map((log) => {
              const accion = ACCIONES[log.accion] || { label: log.accion, color: 'bg-ink/10 text-ink' };
              const entidad = ENTIDADES[log.entidad] || log.entidad;

              return (
                <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-paper2/30 transition-colors">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${accion.color}`}>
                    {accion.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{log.usuario}</span>
                      {' · '}
                      <span className="text-ink/70">{accion.label.toLowerCase()} {entidad}</span>
                      {log.detalle && (
                        <span className="text-ink/50"> — {log.detalle}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-ink/30 mt-0.5">
                      {new Date(log.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-line">
              <button
                onClick={() => cargar(page - 1)}
                disabled={page === 1}
                className="btn-outline !py-1.5 !px-3 text-xs disabled:opacity-30"
              >
                Anterior
              </button>
              <span className="text-xs text-ink/50">Página {page} de {totalPaginas}</span>
              <button
                onClick={() => cargar(page + 1)}
                disabled={page >= totalPaginas}
                className="btn-outline !py-1.5 !px-3 text-xs disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
