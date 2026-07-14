import { motion } from 'framer-motion';

// Divide el texto en palabras y las revela una por una con stagger.
// Las <br/> se pasan como children separados (ver uso en Inicio.jsx).
export function WordReveal({ text, delay = 0, className = '' }) {
  const palabras = text.split(' ');
  return (
    <span className={`inline ${className}`}>
      {palabras.map((palabra, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {palabra}
            {i < palabras.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
