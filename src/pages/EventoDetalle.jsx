import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { PlaceholderEvento } from '../components/PlaceholderEvento';
import { Reveal } from '../components/Reveal';
import { GaleriaAuto } from '../components/GaleriaAuto';
import { formatTime12h, formatTimeRange12h } from '../utils/formatTime';

export default function EventoDetalle() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [error, setError] = useState(false);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

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
    ...(evento.imagenUrl ? [{ url: evento.imagenUrl, position: evento.imagenPosicion || '50% 50%' }] : []),
    ...(evento.imagenes || []).map((img) => ({ url: img.url, position: img.position || '50% 50%' })),
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <Reveal>
        <Link to="/eventos" className="text-azul font-semibold text-sm hover:text-rojo transition-colors">
          ← Volver a eventos
        </Link>
      </Reveal>

      {/* Galería principal con auto-play */}
      <Reveal delay={0.05} className="mt-6">
        {fotos.length > 0 ? (
          <GaleriaAuto
            imagenes={fotos}
            alt={evento.titulo}
            className="shadow-brand"
            aspect="aspect-[16/10]"
            intervalo={3000}
          />
        ) : (
          <div className="rounded-2xl overflow-hidden">
            <PlaceholderEvento categoria={evento.categoria} className="w-full h-72" />
          </div>
        )}
      </Reveal>

      {/* Thumbnails manuales */}
      {fotos.length > 1 && (
        <Reveal delay={0.08}>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-thin">
            {fotos.map((url, i) => (
              <button
                key={i}
                onClick={() => setFotoActiva(i)}
                className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold transition-all duration-200 opacity-70 hover:opacity-100"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* Info del evento */}
      <Reveal delay={0.1}>
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block font-mono text-[11px] text-rojo uppercase tracking-wide bg-rojo/10 px-2.5 py-0.5 rounded-full">
              {evento.categoria}
            </span>
          </div>

          <p className="font-mono text-sm text-ink/50 mb-2">
            {new Date(evento.fecha).toLocaleDateString('es-CO', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            {evento.horaInicio && (
              <span className="ml-2">
                · {formatTimeRange12h(evento.horaInicio, evento.horaFin)}
              </span>
            )}
          </p>

          <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">{evento.titulo}</h1>

          {evento.lugar && (
            <p className="text-ink/60 mb-6 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {evento.lugar}
            </p>
          )}

          {evento.descripcion && (
            <div className="bg-paper2 rounded-2xl p-6 mt-4">
              <p className="text-ink/80 leading-relaxed whitespace-pre-line">{evento.descripcion}</p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
