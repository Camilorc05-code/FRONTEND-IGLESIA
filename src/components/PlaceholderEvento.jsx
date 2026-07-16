// PlaceholderEvento.jsx — ilustración de marca para eventos que aún no tienen
// foto propia. En vez de una foto de stock genérica de internet (con problemas
// de licencia si se publica en un sitio real), usamos un patrón + ícono propio
// por categoría. Se ve intencional y profesional desde el día uno.

const ESTILOS = {
  'Cumbre Ministerial': { bg: '#024293', fg: '#FFFFFF', icon: '⛰️' },
  'Fiesta de Primicias': { bg: '#FFCD02', fg: '#0A2A57', icon: '🌾' },
  'Juntos Bajo la Bendición de Dios': { bg: '#E1011D', fg: '#FFFFFF', icon: '💍' },
  'Acción de Gracias': { bg: '#3E52C3', fg: '#FFFFFF', icon: '🙏' },
  'Ministerio M.I.A': { bg: '#024293', fg: '#FFFFFF', icon: '⭐' },
  'Ministerio M.J.P': { bg: '#FFCD02', fg: '#0A2A57', icon: '🔥' },
  Vigilia: { bg: '#0A2A57', fg: '#FFFFFF', icon: '🕯️' },
  'Día del Padre': { bg: '#024293', fg: '#FFFFFF', icon: '👔' },
  'Día de la Madre': { bg: '#E1011D', fg: '#FFFFFF', icon: '💐' },
  'Día del Hombre': { bg: '#024293', fg: '#FFFFFF', icon: '💪' },
  'Día de la Mujer': { bg: '#E1011D', fg: '#FFFFFF', icon: '👩' },
  Otro: { bg: '#3E52C3', fg: '#FFFFFF', icon: '✨' },
};

let uid = 0;

export function PlaceholderEvento({ categoria, className = '' }) {
  const estilo = ESTILOS[categoria] || ESTILOS.Otro;
  const patternId = `pattern-${uid++}`;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: estilo.bg }}>
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.14]">
        <defs>
          <pattern id={patternId} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <line x1="0" y1="0" x2="0" y2="26" stroke={estilo.fg} strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* anillo decorativo */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: '160%', height: '160%', left: '-30%', top: '-40%',
          border: `2px solid ${estilo.fg}`,
        }}
      />

      <div className="relative h-full flex flex-col items-center justify-center gap-2">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
        >
          {estilo.icon}
        </span>
        <span
          className="text-[11px] font-mono uppercase tracking-wide text-center px-4"
          style={{ color: estilo.fg, opacity: 0.85 }}
        >
          {categoria}
        </span>
      </div>
    </div>
  );
}

export function colorCategoria(categoria) {
  return (ESTILOS[categoria] || ESTILOS.Otro).bg;
}
