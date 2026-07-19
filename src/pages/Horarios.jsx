import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { GlobeGrid } from '../components/GlobeGrid';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { SkeletonLine } from '../components/Skeleton';
import { GaleriaAuto } from '../components/GaleriaAuto';
import { formatTimeRange12h } from '../utils/formatTime';

const ORDEN_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ICONO_DIA = {
  Domingo: '⛪', Lunes: '📖', Martes: '🤝', Miércoles: '🙏',
  Jueves: '🎵', Viernes: '✝️', Sábado: '🌟',
};

export default function Horarios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/servicios').then((r) => setServicios(r.data)).catch(() => {}).finally(() => setCargando(false));
  }, []);

  const porDia = ORDEN_DIAS.map((dia) => ({
    dia,
    items: servicios.filter((s) => s.diaSemana === dia),
  })).filter((g) => g.items.length > 0);

  const todosFotos = servicios.flatMap((s) => [
    ...(s.imagenUrl ? [s.imagenUrl] : []),
    ...(s.imagenes || []).map((img) => img.url),
  ]);

  return (
    <div>
      <section className="bg-amanecer relative overflow-hidden">
        <GlobeGrid className="absolute -left-20 -top-20 w-80 h-80 text-azul" opacity={0.08} />
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center relative">
          <Reveal>
            <p className="eyebrow mb-3">Todas las semanas</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Horarios de servicio</h1>
            <p className="text-ink/60 max-w-md mx-auto mt-4">
              Conoce nuestros horarios y únete a nosotros en cada reunión.
            </p>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      {/* Galería automática de fotos de servicios */}
      {todosFotos.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 md:px-8 pt-10">
          <Reveal>
            <GaleriaAuto
              imagenes={todosFotos}
              alt="Galería de servicios"
              className="shadow-brand"
              intervalo={3000}
            />
          </Reveal>
        </section>
      )}

      {/* Horarios por día */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-14">
        {cargando && (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <SkeletonLine className="h-6 w-32" />
                <SkeletonLine className="h-24 w-full" />
              </div>
            ))}
          </div>
        )}
        {!cargando && porDia.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink/40 text-lg">Aún no hay horarios publicados. Vuelve pronto.</p>
          </div>
        )}

        <div className="space-y-8">
          {porDia.map((g, gi) => (
            <Reveal key={g.dia} delay={gi * 0.06}>
              <div className="relative">
                {/* Encabezado del día */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{ICONO_DIA[g.dia]}</span>
                  <h2 className="font-display text-2xl text-ink">{g.dia}</h2>
                  <div className="flex-1 h-px bg-line ml-2" />
                </div>

                {/* Servicios del día */}
                <StaggerGroup className="space-y-3">
                  {g.items.map((s) => (
                    <StaggerItem key={s.id}>
                      <div className="group bg-white rounded-2xl border border-line p-5 hover:shadow-brand-sm hover:border-gold transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Foto del servicio si tiene */}
                          {(s.imagenUrl || s.imagenes?.length > 0) && (
                            <div className="shrink-0 w-full md:w-24 h-24 rounded-xl overflow-hidden bg-ink/5">
                              <img
                                src={s.imagenUrl || s.imagenes?.[0]?.url}
                                alt={s.nombre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                style={{ objectPosition: s.imagenPosicion || 'center center' }}
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg text-ink">{s.nombre}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                              {s.lugar && (
                                <span className="text-sm text-ink/60 flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                                    <circle cx="12" cy="10" r="2.5" />
                                  </svg>
                                  {s.lugar}
                                </span>
                              )}
                            </div>
                            {s.descripcion && (
                              <p className="text-sm text-ink/50 mt-1.5 line-clamp-2">{s.descripcion}</p>
                            )}
                          </div>

                          {/* Hora - destacada */}
                          <div className="shrink-0 text-right">
                            <div className="inline-flex items-center gap-2 bg-azul/5 rounded-xl px-4 py-2.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-azul">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span className="font-mono text-base font-semibold text-azul">
                                {formatTimeRange12h(s.horaInicio, s.horaFin)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Galería inline si tiene varias fotos */}
                        {s.imagenes?.length > 1 && (
                          <div className="mt-4 pt-4 border-t border-line/50">
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                              {s.imagenes.map((img, i) => (
                                <div key={i} className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold transition-colors">
                                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
