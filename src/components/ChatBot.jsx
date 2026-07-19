import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-iglesia-3op0.onrender.com';

/* ── Knowledge Base ── */
const KB = [
  {
    intents: ['horario', 'horarios', 'hora', 'cuando', 'cuando es', 'servicio', 'culto', 'reunion', 'reuniones'],
    reply: (ctx) => {
      if (!ctx.servicios || ctx.servicios.length === 0) {
        return { text: 'Nuestros horarios están en la página de horarios. ¡Dale un vistazo!', link: '/horarios', linkLabel: 'Ver horarios' };
      }
      const lines = ctx.servicios.map((s) => {
        const hora = s.horaInicio ? ` a las ${s.horaInicio}` : '';
        return `• ${s.diaSemana}${hora} — ${s.nombre}`;
      });
      return { text: `Estos son nuestros horarios:\n\n${lines.join('\n')}\n\n¿Te gustaría asistir a alguno?`, link: '/horarios', linkLabel: 'Ver todos los horarios' };
    },
  },
  {
    intents: ['evento', 'eventos', 'qué hay', 'proximo', 'próximo', 'actividad', 'actividades', 'reunion especial'],
    reply: (ctx) => {
      if (!ctx.eventos || ctx.eventos.length === 0) {
        return { text: 'No hay eventos próximos programados en este momento. Puedes revisar la página de eventos para más información.', link: '/eventos', linkLabel: 'Ver eventos' };
      }
      const lines = ctx.eventos.slice(0, 5).map((e) => {
        const fecha = new Date(e.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
        const hora = e.horaInicio ? ` a las ${e.horaInicio}` : '';
        const lugar = e.lugar ? ` — ${e.lugar}` : '';
        return `• ${e.titulo}\n  📅 ${fecha}${hora}${lugar}`;
      });
      const extra = ctx.eventos.length > 5 ? `\n\n... y ${ctx.eventos.length - 5} evento(s) más` : '';
      return { text: `Estos son nuestros próximos eventos:\n\n${lines.join('\n\n')}${extra}`, link: '/eventos', linkLabel: 'Ver todos los eventos' };
    },
  },
  {
    intents: ['cita', 'cita pastoral', 'pastor', 'hablar con', 'conversar', 'orientación', 'consejería', 'necesito hablar'],
    reply: () => ({ text: 'Puedes agendar una cita pastoral para hablar con nuestro equipo. Es gratuito y confidencial. Agenda tu cita desde nuestra página.', link: '/citas', linkLabel: 'Agendar cita pastoral' }),
  },
  {
    intents: ['registro', 'registrarse', 'miembro', 'unirse', 'iglesia', 'pertenecer', 'formar parte'],
    reply: () => ({ text: '¡Qué alegría que quieras ser parte de nuestra familia! Puedes completar tu registro en línea desde nuestra página.', link: '/registrarse', linkLabel: 'Registrarme ahora' }),
  },
  {
    intents: ['donar', 'ofrenda', 'diezmo', 'contribuir', 'aportar', 'dar', 'donación', 'donaciones', 'apoyar'],
    reply: () => ({ text: 'Gracias por tu generosidad. Puedes hacer tus ofrendas y donaciones de forma segura en línea.', link: '/donaciones', linkLabel: 'Hacer una donación' }),
  },
  {
    intents: ['bebé', 'baby', 'presentación', 'bautizo bebe', 'bautizo', 'niño', 'nacimiento'],
    reply: () => ({ text: 'Las presentaciones de bebés son muy especiales. Para coordinar la fecha, agenda una cita con el pastor.', link: '/citas', linkLabel: 'Agendar cita para bebé' }),
  },
  {
    intents: ['ubicación', 'dirección', 'dónde', 'llegar', 'mapa', 'Cómo llegar', 'Cómo llego'],
    reply: () => ({ text: '📍 Estamos en Calle 12 #10-19, Paz de Ariporo, Casanare. ¡Te esperamos!' }),
  },
  {
    intents: ['teléfono', 'celular', 'contacto', 'whatsapp', 'llamar', 'comunicar'],
    reply: () => ({ text: 'Puedes contactarnos por:\n\n📱 WhatsApp: +57 313 295 9669\n📧 Email: info@misionpanamericana.com\n\nTambién nos encuentras en redes sociales.' }),
  },
  {
    intents: ['facebook'],
    reply: () => ({ text: 'Síguenos en Facebook para estar al día con todas las novedades.', link: 'https://www.facebook.com/share/1D2fXLv3hM/?mibextid=wwXIfr', linkLabel: 'Ir a Facebook', external: true }),
  },
  {
    intents: ['instagram'],
    reply: () => ({ text: 'Síguenos en Instagram para contenido inspirador y actualizaciones.', link: 'https://www.instagram.com/mision_panamericana_pza', linkLabel: 'Ir a Instagram', external: true }),
  },
  {
    intents: ['redes sociales', 'redes', 'síguenos'],
    reply: () => ({ text: '¡Síguenos en nuestras redes sociales!\n\n📘 Facebook: @mision_panamericana_pza\n📷 Instagram: @mision_panamericana_pza\n\n¡Comparte con tus amigos!' }),
  },
  {
    intents: ['quién', 'quienes', 'pastores', 'lideres', 'equipo', 'dirige'],
    reply: () => ({ text: 'Nuestra iglesia es liderada por un equipo dedicado de pastores y líderes comprometidos con el servicio. Puedes conocernos en nuestra página.', link: '/', linkLabel: 'Conocer más' }),
  },
  {
    intents: ['misión', 'visión', 'qué creen', 'creencias', 'valores'],
    reply: () => ({ text: 'Somos Misión Panamericana — Centro de Fe y Esperanza. Nuestra misión es llevar el amor de Dios a cada familia.\n\nCreemos en:\n• La salvación por gracia\n• El bautismo en el Espíritu Santo\n• La sanidad y restauración\n• La comunidad y el servicio' }),
  },
  {
    intents: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    reply: (ctx) => {
      return { text: 'Tenemos servicios durante toda la semana. Visita nuestra página de horarios para ver los detalles de cada día.', link: '/horarios', linkLabel: 'Ver horarios' };
    },
  },
  {
    intents: ['niños', 'infantil', 'escuela dominical', 'escuela', 'dominical', 'adolescentes', 'jóvenes'],
    reply: () => ({ text: 'Tenemos programas para toda la familia, incluyendo actividades para niños y jóvenes. Agenda una cita para más detalles.', link: '/citas', linkLabel: 'Agendar cita' }),
  },
  {
    intents: ['ayuda', 'necesito', 'emergencia', 'crisis', 'apoyo', 'socorro'],
    reply: () => ({ text: 'Si estás pasando por una situación difícil, estamos aquí para ayudarte. Agenda una cita pastoral confidencial.', link: '/citas', linkLabel: 'Agendar cita pastoral' }),
  },
  {
    intents: ['gracias', 'thank', 'bendiciones', 'bendición'],
    reply: () => ({ text: '¡Bendiciones para ti también! 😊 Si necesitas algo más, estaré aquí para ayudarte.' }),
  },
  {
    intents: ['adiós', 'hasta luego', 'nos vemos', 'bye', 'chao'],
    reply: () => ({ text: '¡Hasta pronto! Que Dios te bendiga. 🙏 Recuerda que estamos aquí para servirte cuando lo necesites.' }),
  },
  {
    intents: ['nombre', 'cómo te llamas', 'quién eres', 'qué eres'],
   reply: () => ({ text: 'Soy el asistente virtual de Misión Panamericana. Puedo ayudarte con información sobre horarios, eventos, citas, donaciones y más. ¿En qué te puedo ayudar?' }),
  },
];

/* ── Greetings / Small talk ── */
const GREETINGS = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'buenas'];
const THANKS = ['gracias', 'thank', 'thanks', 'agradezco', 'bendiciones'];
const BYES = ['adiós', 'hasta luego', 'nos vemos', 'bye', 'chao', 'chau'];

/* ── Intent Detection ── */
function detectIntent(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check greetings
  if (GREETINGS.some((g) => lower.includes(g))) return { type: 'greeting' };
  if (THANKS.some((t) => lower.includes(t))) return { type: 'thanks' };
  if (BYES.some((b) => lower.includes(b))) return { type: 'bye' };

  // Check KB intents
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KB) {
    for (const intent of entry.intents) {
      const intentNorm = intent.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(intentNorm)) {
        const score = intentNorm.length / lower.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry;
        }
      }
    }
  }

  if (bestMatch) return { type: 'kb', entry: bestMatch };
  return { type: 'unknown' };
}

/* ── Response Generator ── */
function generateReply(text, ctx) {
  const intent = detectIntent(text);

  switch (intent.type) {
    case 'greeting':
      return {
        text: '¡Hola! 👋 Bienvenido a Misión Panamericana. ¿En qué puedo ayudarte hoy?',
      };
    case 'thanks':
      return { text: '¡Con gusto! Si necesitas algo más, no dudes en preguntar. 😊' };
    case 'bye':
      return { text: '¡Hasta pronto! Que Dios te bendiga. 🙏 Recuerda que estamos aquí para servirte cuando lo necesites.' };
    case 'kb': {
      const reply = intent.entry.reply(ctx);
      return {
        text: reply.text,
        link: reply.link,
        linkLabel: reply.linkLabel,
        external: reply.external,
      };
    }
    default:
      return {
        text: 'No estoy seguro de entender tu pregunta, pero puedo ayudarte con:\n\n• Horarios de servicios\n• Próximos eventos\n• Citas pastorales\n• Donaciones\n• Registro de miembros\n• Ubicación y contacto\n\n¿Qué te gustaría saber?',
      };
  }
}

/* ── Components ── */
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

function MessageBubble({ msg, onLink }) {
  const isUser = msg.from === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[80%]">
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'bg-[#024293] text-white rounded-2xl rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
          }`}
        >
          {msg.text}
        </div>

        {/* Link button */}
        {msg.link && (
          <button
            onClick={() => onLink(msg.link, msg.external)}
            className="mt-2 ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#024293]/10 text-[#024293] text-xs font-medium rounded-full hover:bg-[#024293]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {msg.linkLabel || 'Ir a la página'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [servicios, setServicios] = useState(null);
  const [eventos, setEventos] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  // Load real services and events from API
  useEffect(() => {
    fetch(`${API_URL}/api/servicios`)
      .then((r) => r.json())
      .then((data) => setServicios(data))
      .catch(() => {});
    fetch(`${API_URL}/api/eventos?tipo=proximos`)
      .then((r) => r.json())
      .then((data) => setEventos(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open && !welcomeSent.current) {
      welcomeSent.current = true;
      setMessages([{
        id: Date.now(),
        from: 'bot',
        text: '¡Hola! Soy el asistente de Misión Panamericana. 👋\n\nPuedo ayudarte con:\n• Horarios de servicios\n• Próximos eventos\n• Citas pastorales\n• Donaciones\n• Registro de miembros\n• Ubicación y contacto\n\n¿Qué te gustaría saber?',
      }]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function handleSend(text) {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = { id: Date.now(), from: 'user', text: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setConversationHistory((prev) => [...prev, { role: 'user', text: msgText }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const ctx = { servicios, eventos, history: conversationHistory };
      const reply = generateReply(msgText, ctx);

      setTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: reply.text,
        link: reply.link,
        linkLabel: reply.linkLabel,
        external: reply.external,
        quickReplies: reply.quickReplies,
      }]);
      setConversationHistory((prev) => [...prev, { role: 'bot', text: reply.text }]);
    }, 400 + Math.random() * 300);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[9rem] right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
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

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onLink={(link, external) => {
                    if (external) {
                      window.open(link, '_blank');
                    } else {
                      window.location.href = link;
                    }
                  }}
                />
              ))}
              {typing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

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
                onClick={() => handleSend()}
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
