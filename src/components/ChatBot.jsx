import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RESPONSES = [
  { keys: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches'], text: '¡Hola! 👋 Bienvenido a Misión Panamericana. ¿En qué puedo ayudarte?' },
  { keys: ['horario', 'hora', 'cuando', 'servicio', 'culto'], text: 'Nuestros horarios son: 🕐 Domingo: 9:00 AM y 6:00 PM | 🕐 Miércoles: 7:00 PM (Oración) | 🕐 Viernes: 7:00 PM (Jóvenes)' },
  { keys: ['donde', 'ubicación', 'dirección', 'llegar', 'mapa'], text: '📍 Estamos en Calle 12 #10-19, Paz de Ariporo, Casanare. ¡Te esperamos!' },
  { keys: ['evento', 'eventos', 'qué hay', 'próximo'], text: 'Puedes ver todos nuestros eventos en nuestra página de eventos. ¡Hay cosas emocionantes cada semana! 🎉' },
  { keys: ['cita', 'cita pastoral', 'pastor', 'hablar con'], text: 'Puedes agendar una cita pastoral en: misionpanamericana.vercel.app/citas 📅' },
  { keys: ['registro', 'registrarse', 'miembro', 'unirse'], text: '¡Qué alegría que quieras unirte! Puedes registrarte en: misionpanamericana.vercel.app/registrarse ✍️' },
  { keys: ['donar', 'ofrenda', 'diezmo', 'contribuir'], text: 'Puedes hacer tus ofrendas en: misionpanamericana.vercel.app/donaciones 💝' },
  { keys: ['bebé', 'baby', 'presentación', 'bautizo bebe'], text: 'Las presentaciones de bebés se coordinan con el pastor. Agenda una cita para más información.' },
  { keys: ['teléfono', 'celular', 'contacto', 'whatsapp'], text: '📱 WhatsApp: +57 313 295 9669 | 📧 Facebook e Instagram: @mision_panamericana_pza' },
  { keys: ['facebook'], text: 'Síguenos en Facebook: facebook.com/share/1D2fXLv3hM' },
  { keys: ['instagram'], text: 'Síguenos en Instagram: @mision_panamericana_pza' },
];

const DEFAULT_MSG = 'Gracias por tu mensaje. Un miembro de nuestro equipo te contactará pronto. Mientras tanto, puedes visitar nuestra página en misionpanamericana.vercel.app';

function getReply(input) {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const { keys, text } of RESPONSES) {
    if (keys.some((k) => lower.includes(k))) return text;
  }
  return DEFAULT_MSG;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md max-w-[80%]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.from === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`px-4 py-2.5 text-sm leading-relaxed max-w-[80%] ${
          isUser
            ? 'bg-[#024293] text-white rounded-2xl rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && !welcomeSent.current) {
      welcomeSent.current = true;
      setMessages([{ id: Date.now(), from: 'bot', text: '¡Hola! Soy el asistente de Misión Panamericana. ¿Cómo puedo ayudarte hoy?' }]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: getReply(text) }]);
    }, 300);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-[5.25rem] right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#024293] shadow-lg text-white hover:shadow-xl transition-shadow"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="currentColor"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14H5.17L4 17.17V4h16v12Z" />
              <path d="M7 9h2v2H7V9Zm4 0h2v2h-2V9Zm4 0h2v2h-2V9Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[9rem] right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#024293] px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  MP
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">Misión Panamericana</h3>
                  <span className="text-white/70 text-xs">En línea</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {typing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-3 py-3 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-sm px-4 py-2.5 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-[#024293]/30 transition-shadow placeholder:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Enviar mensaje"
                className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center text-white shrink-0 hover:bg-[#c49416] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
