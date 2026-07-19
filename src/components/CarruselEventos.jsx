import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlaceholderEvento } from './PlaceholderEvento';
import { formatTime12h } from '../utils/formatTime';

export function CarruselEventos({ eventos }) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [constraint, setConstraint] = useState(0);

  useEffect(() => {
    function medir() {
      if (trackRef.current && containerRef.current) {
        const overflow = trackRef.current.scrollWidth - containerRef.current.offsetWidth;
        setConstraint(overflow > 0 ? -overflow : 0);
      }
    }
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [eventos]);

  return (
    <div ref={containerRef} className="overflow-hidden -mx-5 px-5 md:mx-0 md:px-0 cursor-grab active:cursor-grabbing">
      <motion.div
        ref={trackRef}
        className="flex gap-5"
        drag="x"
        dragConstraints={{ left: constraint, right: 0 }}
        dragElastic={0.08}
        whileTap={{ cursor: 'grabbing' }}
      >
        {eventos.map((e) => (
          <Link
            key={e.id}
            to={`/eventos/${e.id}`}
            draggable={false}
            className="group shrink-0 w-64 md:w-72 rounded-2xl overflow-hidden border border-line bg-white hover:shadow-brand transition-shadow duration-300 select-none"
          >
            <div className="overflow-hidden h-36 pointer-events-none">
              {e.imagenUrl ? (
                <img src={e.imagenUrl} alt={e.titulo} className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" style={{ objectPosition: e.imagenPosicion || '50% 50%' }} draggable={false} />
              ) : (
                <PlaceholderEvento categoria={e.categoria} className="w-full h-36 transition-transform duration-500 group-hover:scale-110" />
              )}
            </div>
            <div className="p-4 pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-mono text-xs text-rojo uppercase tracking-wide">
                  {new Date(e.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {e.horaInicio && (
                  <span className="text-xs text-ink/40">· {formatTime12h(e.horaInicio)}</span>
                )}
              </div>
              <h3 className="font-display text-lg text-ink group-hover:text-azul transition-colors">{e.titulo}</h3>
              {e.lugar && <p className="text-sm text-ink/60 mt-2">{e.lugar}</p>}
            </div>
          </Link>
        ))}
      </motion.div>
      <p className="text-center text-[11px] font-mono uppercase tracking-widest text-ink/30 mt-4 md:hidden">
        ← Desliza para ver más →
      </p>
    </div>
  );
}
