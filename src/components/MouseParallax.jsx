import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Envuelve una sección; los hijos que sean <MouseParallax.Layer depth={N}>
// se moverán proporcionalmente a la posición del mouse dentro del contenedor.
export function MouseParallax({ children, className = '' }) {
  const ref = useRef(null);
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

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className}>
      {typeof children === 'function' ? children({ mvX, mvY }) : children}
    </div>
  );
}

export function ParallaxLayer({ mvX, mvY, depth = 20, children, className = '', animate, transition }) {
  const x = useSpring(useTransform(mvX, (v) => v * depth), { stiffness: 150, damping: 20 });
  const y = useSpring(useTransform(mvY, (v) => v * depth), { stiffness: 150, damping: 20 });
  return (
    <motion.div style={{ x, y }} className={className} animate={animate} transition={transition}>
      {children}
    </motion.div>
  );
}
