import { motion } from 'framer-motion';

const WHATSAPP_URL =
  'https://wa.me/573132959669?text=' +
  encodeURIComponent('Hola, quisiera más información sobre Misión Panamericana 🙏');

export function BotonWhatsapp() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-brand"
      style={{ backgroundColor: '#25D366' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: '#25D366' }}
        animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <svg viewBox="0 0 32 32" className="w-7 h-7 relative z-10" fill="white">
        <path d="M16.04 4C9.4 4 4 9.4 4 16.04c0 2.2.6 4.28 1.63 6.06L4 28l6.08-1.6a11.98 11.98 0 0 0 5.96 1.6h.01c6.64 0 12.03-5.4 12.03-12.04C28.08 9.4 22.68 4 16.04 4Zm0 21.94h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.6.95.96-3.5-.24-.36a9.9 9.9 0 0 1-1.52-5.29c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.04 7.01 2.9a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.9-9.92 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </motion.a>
  );
}
