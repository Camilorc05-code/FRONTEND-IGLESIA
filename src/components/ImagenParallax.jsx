import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSkipDecorations } from '../utils/performance';

// Debe ir dentro de un contenedor con position:relative y tamaño definido
// (aspect ratio o alto fijo). La imagen se mueve más lento/rápido que el
// scroll de la página, dando sensación de profundidad real.
export function ImagenParallax({ src, alt, className = '', recorrido = 46, imgStyle = {} }) {
  const ref = useRef(null);
  const skip = useSkipDecorations();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-recorrido, recorrido]);

  // En dispositivos de poca potencia el efecto parallax se desactiva
  // y la imagen queda estática (sin scroll-linked movement).
  if (skip) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <img src={src} alt={alt} style={{ height: '100%', ...imgStyle }} className="w-full object-cover" />
      </div>
    );
  }

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, height: `calc(100% + ${recorrido * 2}px)`, ...imgStyle }}
        className="w-full object-cover"
      />
    </div>
  );
}
