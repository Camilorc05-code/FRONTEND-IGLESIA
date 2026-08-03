import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSkipDecorations } from '../utils/performance';

// Envuelve una sección; los hijos que sean <MouseParallax.Layer depth={N}>
// se moverán proporcionalmente a la posición del mouse dentro del contenedor.
// En dispositivos de poca potencia el parallax se desactiva y el contenido
// se renderiza estático (sin listeners de mouse).
export function MouseParallax({ children, className = '' }) {
  const ref = useRef(null);
  const skip = useSkipDecorations();
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  function onMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() {
    mvX.set(0);
    mvY.set(0);
  }

  if (skip) {
    return <div className={className}>{typeof children === 'function' ? children({ mvX: 0, mvY: 0 }) : children}</div>;
  }

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className}>
      {typeof children === 'function' ? children({ mvX, mvY }) : children}
    </div>
  );
}

export function ParallaxLayer({ mvX, mvY, depth = 20, children, className = '', animate, transition }) {
  const skip = useSkipDecorations();
  const x = useSpring(useTransform(mvX, (v) => v * depth), { stiffness: 150, damping: 20 });
  const y = useSpring(useTransform(mvY, (v) => v * depth), { stiffness: 150, damping: 20 });

  // En dispositivos de poca potencia no se aplican animaciones infinitas
  // (las manchas de color del hero quedan estáticas).
  if (skip) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div style={{ x, y }} className={className} animate={animate} transition={transition}>
      {children}
    </motion.div>
  );
}
