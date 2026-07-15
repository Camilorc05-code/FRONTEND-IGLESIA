import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { GlobeGrid } from '../components/GlobeGrid';
import { PlaceholderEvento } from '../components/PlaceholderEvento';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { SkeletonGrid } from '../components/Skeleton';
import { TiltCard } from '../components/TiltCard';

export default function Eventos() {
  const [tab, setTab] = useState('todos');
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/eventos/categorias').then((r) => setCategorias(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (tab !== 'todos') params.tipo = tab;
    if (categoriaActiva) params.categoria = categoriaActiva;
    api.get('/eventos', { params }).then((r) => setEventos(r.data)).catch(() => setEventos([])).finally(() => setCargando(false));
  }, [tab, categoriaActiva]);

  const grupos = categorias
    .map((cat) => ({ categoria: cat, items: eventos.filter((e) => e.categoria === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <section className="bg-amanecer relative overflow-hidden">
        <GlobeGrid className="absolute -right-20 -top-16 w-80 h-80 text-rojo" opacity={0.08} />
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center relative">
          <Reveal>
            <p className="eyebrow mb-3">Vida en comunidad</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Galería de eventos</h1>
            <p className="text-ink/60 max-w-lg mx-auto mt-4">
              Un vistazo a lo que Dios ha hecho entre nosotros a lo largo de los años.
            </p>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        {/* Filtros */}
        <Reveal className="flex flex-wrap gap-2 justify-center mb-4">
          {[{ id: 'todos', label: 'Todos' }, { id: 'proximos', label: 'Próximos' }, { id: 'pasados', label: 'Realizados' }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === t.id ? 'text-paper' : 'bg-paper2 text-ink/60 hover:text-ink'
              }`}
            >
              {tab === t.id && (
                <motion.span layoutId="tab-bg" className="absolute inset-0 bg-ink rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.05} className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setCategoriaActiva('')}
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide transition-all ${
              categoriaActiva === '' ? 'bg-gold text-ink' : 'bg-white border border-line text-ink/50 hover:text-ink hover:border-gold'
            }`}
          >
            Todas las categorías
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoriaActiva(c)}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide transition-all ${
                categoriaActiva === c ? 'bg-gold text-ink' : 'bg-white border border-line text-ink/50 hover:text-ink hover:border-gold'
              }`}
            >
              {c}
            </button>
          ))}
        </Reveal>

        {cargando && <SkeletonGrid count={6} />}

        <AnimatePresence mode="wait">
          {!cargando && (
            <motion.div
              key={tab + categoriaActiva}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {grupos.length === 0 && (
                <p className="text-ink/50 text-center">No hay eventos para mostrar con este filtro.</p>
              )}

              <div className="space-y-14">
                {grupos.map((g) => (
                  <div key={g.categoria}>
                    <Reveal>
                      <h2 className="font-display text-2xl text-azul mb-5">{g.categoria}</h2>
                    </Reveal>
                    <StaggerGroup className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {g.items.map((e) => (
                        <StaggerItem key={e.id}>
                          <TiltCard max={5} className="group block rounded-2xl overflow-hidden border border-line bg-white hover:shadow-brand hover:-translate-y-1 transition-all duration-300">
                          <Link to={`/eventos/${e.id}`} className="block">
                            <div className="overflow-hidden h-40">
                              {e.imagenUrl ? (
                                <img src={e.imagenUrl} alt={e.titulo} className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110" />
                              ) : (
                                <PlaceholderEvento categoria={e.categoria} className="w-full h-40 transition-transform duration-500 group-hover:scale-110" />
                              )}
                            </div>
                            <div className="p-4">
                              <p className="font-mono text-[11px] text-rojo uppercase tracking-wide mb-1">
                                {new Date(e.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <h3 className="font-display text-lg text-ink leading-snug group-hover:text-azul transition-colors">
                                {e.titulo}
                              </h3>
                              {e.lugar && <p className="text-xs text-ink/50 mt-1">{e.lugar}</p>}
                            </div>
                          </Link>
                          </TiltCard>
                        </StaggerItem>
                      ))}
                    </StaggerGroup>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
