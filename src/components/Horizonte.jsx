// Horizonte.jsx — el elemento firma del sitio: una línea de azul ondulada
// con un arco de sol, evocando el paisaje llanero de Casanare.
// Se usa como divisor entre secciones a lo largo del sitio.

export function Horizonte({ flip = false, className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className={`w-full h-16 md:h-20 ${flip ? 'rotate-180' : ''}`}
      >
        <path
          d="M0,45 C150,15 300,60 450,35 C600,10 750,55 900,30 C1050,10 1150,40 1200,25 L1200,80 L0,80 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

// Pequeño arco de sol naciente — usado en el hero y como acento puntual.
export function SolNaciente({ className = '' }) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0C978" />
          <stop offset="100%" stopColor="#DFA640" />
        </linearGradient>
      </defs>
      <path d="M20,100 A80,80 0 0,1 180,100 Z" fill="url(#solGrad)" />
      {[...Array(5)].map((_, i) => (
        <line
          key={i}
          x1={100}
          y1={12}
          x2={100 + Math.cos((Math.PI / 6) * (i - 2)) * 14}
          y2={12 - Math.sin((Math.PI / 6) * (i - 2)) * 14}
          stroke="#DFA640"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${(i - 2) * 22} 100 20)`}
        />
      ))}
    </svg>
  );
}
