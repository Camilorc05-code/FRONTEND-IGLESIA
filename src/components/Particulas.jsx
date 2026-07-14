import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Partículas suaves que flotan hacia arriba, en los colores de marca.
// Puramente decorativo — no interactúa con el mouse, corre en loop infinito.
export function Particulas({ count = 16, className = '' }) {
  const particulas = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 4 + Math.random() * 92,
        size: 2 + Math.random() * 3.5,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 10,
        distancia: 220 + Math.random() * 260,
        color: ['#DFA640', '#024293', '#E1011D', '#3E52C3'][i % 4],
      })),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {particulas.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: '-2%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -p.distancia, opacity: [0, 0.55, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
