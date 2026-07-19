import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Galería de imágenes con reproducción automática.
 * - Transiciones suaves con crossfade + ligero zoom
 * - Indicadores clickeables
 * - Pausa al hover
 * - Botones de navegación lateral
 * - Responsive: se adapta al contenedor padre
 */
export function GaleriaAuto({ imagenes, alt = 'Galería', className = '', intervalo = 2800, aspect = 'aspect-video' }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Soporta tanto strings como objetos {url, position}
  const total = imagenes?.length || 0;
  const getUrl = (img) => typeof img === 'string' ? img : img.url;
  const getPos = (img) => typeof img === 'string' ? '50% 50%' : (img.position || '50% 50%');

  const siguiente = useCallback(() => {
    setActual((prev) => (prev + 1) % total);
  }, [total]);

  const anterior = useCallback(() => {
    setActual((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || pausado) return;
    const id = setInterval(siguiente, intervalo);
    return () => clearInterval(id);
  }, [total, pausado, siguiente, intervalo]);

  if (!total) return null;

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Imagen actual con transición */}
      <div className={`relative ${aspect} overflow-hidden bg-ink/5`}>
        <AnimatePresence>
          <motion.img
            key={actual}
            src={getUrl(imagenes[actual])}
            alt={`${alt} ${actual + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: getPos(imagenes[actual]) }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Gradiente inferior sutil */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Contador de fotos */}
        {total > 1 && (
          <div className="absolute top-3 right-3 bg-ink/60 backdrop-blur-sm text-paper text-xs font-mono px-2.5 py-1 rounded-full">
            {actual + 1} / {total}
          </div>
        )}
      </div>

      {/* Botones de navegación (solo si hay más de 1 imagen) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); anterior(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/80 backdrop-blur shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-paper"
            aria-label="Imagen anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); siguiente(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/80 backdrop-blur shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-paper"
            aria-label="Siguiente imagen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Indicadores de puntos */}
      {total > 1 && total <= 15 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {imagenes.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActual(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === actual
                  ? 'w-6 h-2 bg-paper shadow-md'
                  : 'w-2 h-2 bg-paper/50 hover:bg-paper/80'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Miniatura de galería - versión compacta para cards.
 * Muestra las primeras imágenes en miniatura.
 */
export function GaleriaMini({ imagenes, className = '' }) {
  if (!imagenes?.length) return null;
  const mostrables = imagenes.slice(0, 4);
  const restantes = imagenes.length - 4;
  const getUrl = (img) => typeof img === 'string' ? img : img.url;
  const getPos = (img) => typeof img === 'string' ? '50% 50%' : (img.position || '50% 50%');

  return (
    <div className={`grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${className}`}>
      {mostrables.map((img, i) => (
        <div key={i} className="relative aspect-square overflow-hidden bg-ink/5">
          <img src={getUrl(img)} alt="" className="w-full h-full object-cover" style={{ objectPosition: getPos(img) }} />
          {i === 3 && restantes > 0 && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="text-paper font-display text-lg">+{restantes}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
