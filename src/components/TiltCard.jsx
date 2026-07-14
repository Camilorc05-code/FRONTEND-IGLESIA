import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function TiltCard({ children, className = '', max = 8 }) {
  const ref = useRef(null);
  const mvX = useMotionValue(0.5);
  const mvY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mvY, [0, 1], [max, -max]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mvX, [0, 1], [-max, max]), { stiffness: 300, damping: 25 });
  const glowX = useTransform(mvX, [0, 1], ['0%', '100%']);
  const glowY = useTransform(mvY, [0, 1], ['0%', '100%']);

  function onMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width);
    mvY.set((e.clientY - rect.top) / rect.height);
  }

  function onMouseLeave() {
    mvX.set(0.5);
    mvY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className}`}
    >
      {/* brillo que sigue al cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([gx, gy]) => `radial-gradient(180px circle at ${gx} ${gy}, rgba(255,205,2,0.18), transparent 70%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}
