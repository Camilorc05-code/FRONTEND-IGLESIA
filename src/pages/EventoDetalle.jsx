import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { PlaceholderEvento } from '../components/PlaceholderEvento';
import { Reveal } from '../components/Reveal';

export default function EventoDetalle() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [error, setError] = useState(false);
  const [fotoActiva, setFotoActiva] = useState(0);

  useEffect(() => {
    setEvento(null);
    setFotoActiva(0);
    api.get(`/eventos/${id}`).then((r) => setEvento(r.data)).catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <p className="text-ink/60">No encontramos este evento.</p>
        <Link to="/eventos" className="text-azul font-semibold mt-4 inline-block">← Volver a eventos</Link>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 animate-pulse">
        <div className="h-4 w-24 skeleton-pulse rounded mb-6" />
        <div className="h-80 skeleton-pulse rounded-2xl mb-4" />
        <div className="h-3 w-40 skeleton-pulse rounded mb-3" />
        <div className="h-8 w-2/3 skeleton-pulse rounded mb-4" />
        <div className="h-3 w-full skeleton-pulse rounded mb-2" />
        <div className="h-3 w-4/5 skeleton-pulse rounded" />
      </div>
    );
  }

  const fotos = [
    ...(evento.imagenUrl ? [evento.imagenUrl] : []),
    ...(evento.imagenes || []).map((img) => img.url),
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <Reveal>
        <Link to="/eventos" className="text-azul font-semibold text-sm hover:text-rojo transition-colors">
          ← Volver a eventos
        </Link>
      </Reveal>

      <Reveal delay={0.05} className="mt-6 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={fotoActiva}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {fotos.length > 0 ? (
              <img src={fotos[fotoActiva]} alt={evento.titulo} className="w-full max-h-[28rem] object-cover" />
            ) : (
              <PlaceholderEvento categoria={evento.categoria} className="w-full h-72" />
            )}
          </motion.div>
        </AnimatePresence>
      </Reveal>

      {fotos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {fotos.map((url, i) => (
            <button
              key={i}
              onClick={() => setFotoActiva(i)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === fotoActiva ? 'border-gold scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Reveal delay={0.1}>
        <p className="eyebrow mt-8 mb-2">
          {evento.categoria} ·{' '}
          {new Date(evento.fecha).toLocaleDateString('es-CO', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
          {evento.horaInicio ? ` · ${evento.horaInicio}${evento.horaFin ? '–' + evento.horaFin : ''}` : ''}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">{evento.titulo}</h1>
        {evento.lugar && <p className="text-ink/60 mb-6">📍 {evento.lugar}</p>}
        {evento.descripcion && (
          <p className="text-ink/80 leading-relaxed whitespace-pre-line">{evento.descripcion}</p>
        )}
      </Reveal>
    </div>
  );
}
