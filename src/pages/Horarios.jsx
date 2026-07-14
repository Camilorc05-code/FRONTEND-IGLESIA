import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { GlobeGrid } from '../components/GlobeGrid';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { SkeletonLine } from '../components/Skeleton';

const ORDEN_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

  return (
    <div>
      <section className="bg-amanecer relative overflow-hidden">
        <GlobeGrid className="absolute -left-20 -top-20 w-80 h-80 text-azul" opacity={0.08} />
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center relative">
          <Reveal>
            <p className="eyebrow mb-3">Todas las semanas</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Horarios de servicio</h1>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      <section className="max-w-3xl mx-auto px-5 md:px-8 py-14">
        {cargando && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <SkeletonLine key={i} className="h-20 w-full" />)}
          </div>
        )}
        {!cargando && porDia.length === 0 && (
          <p className="text-ink/50">Aún no hay horarios publicados. Vuelve pronto.</p>
        )}

        <div className="space-y-10">
          {porDia.map((g, gi) => (
            <Reveal key={g.dia} delay={gi * 0.06}>
              <h2 className="font-display text-2xl text-rojo mb-4">{g.dia}</h2>
              <StaggerGroup className="space-y-3">
                {g.items.map((s) => (
                  <StaggerItem key={s.id}>
                    <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:shadow-md hover:border-gold">
                      <div>
                        <h3 className="font-display text-lg text-ink">{s.nombre}</h3>
                        {s.lugar && <p className="text-sm text-ink/60">{s.lugar}</p>}
                        {s.descripcion && <p className="text-sm text-ink/50 mt-1">{s.descripcion}</p>}
                      </div>
                      <p className="font-mono text-xl text-azul whitespace-nowrap">
                        {s.horaInicio}{s.horaFin ? ` – ${s.horaFin}` : ''}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
