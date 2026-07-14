import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoMision from '../assets/logo-mision-transparente.png';

export function IntroSplash() {
  const [show, setShow] = useState(false);
  // undefined = todavía no decidido. Se decide UNA vez dentro del efecto
  // (no durante el render) y el valor se reutiliza aunque React vuelva a
  // ejecutar el efecto dos veces en desarrollo (StrictMode).
  const decisionRef = useRef(undefined);

  useEffect(() => {
    if (decisionRef.current === undefined) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const yaVista = sessionStorage.getItem('intro-vista');
      decisionRef.current = !(reducedMotion || yaVista);
      if (decisionRef.current) sessionStorage.setItem('intro-vista', '1');
    }

    if (!decisionRef.current) return;

    setShow(true);
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink overflow-hidden"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative flex items-center justify-center">
            {/* placa de luz: sin esto, las líneas blancas del globo del logo
                se pierden contra el fondo oscuro */}
            <motion.div
              className="absolute rounded-full blur-2xl -z-10"
              style={{ width: '16rem', height: '16rem', background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)' }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.6 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.img
              src={logoMision}
              alt="Misión Panamericana"
              className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* barrido de luz dorada, recortado exactamente a la silueta
                transparente del logo (mask-image) para que no se vea como
                un rectángulo flotando */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: 'linear-gradient(115deg, transparent 30%, rgba(255,205,2,0.65) 50%, transparent 70%)',
                WebkitMaskImage: `url(${logoMision})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${logoMision})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
              initial={{ x: '-150%' }}
              animate={{ x: '150%' }}
              transition={{ duration: 1, delay: 0.55, ease: 'easeInOut' }}
            />
          </div>

          <motion.p
            className="absolute bottom-16 font-mono text-[11px] uppercase tracking-[0.3em] text-paper/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            Centro de Fe y Esperanza
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
