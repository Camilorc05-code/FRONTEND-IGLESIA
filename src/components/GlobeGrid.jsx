// GlobeGrid.jsx — la malla de líneas del globo terráqueo del logo de la Misión,
// reutilizada como textura de fondo. No es un patrón genérico: es el mismo motivo
// geométrico que ya vive en la marca, solo que sutil y a gran escala.

export function GlobeGrid({ className = '', opacity = 0.08 }) {
  return (
    <svg viewBox="0 0 600 600" className={className} style={{ opacity }} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="300" cy="300" r="260" />
        {/* meridianos */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <ellipse
            key={deg}
            cx="300"
            cy="300"
            rx={260 * Math.abs(Math.cos((deg * Math.PI) / 180)) || 2}
            ry="260"
            transform={`rotate(${deg} 300 300)`}
          />
        ))}
        {/* paralelos */}
        {[-190, -120, -50, 50, 120, 190].map((dy) => (
          <ellipse key={dy} cx="300" cy={300 + dy} rx={Math.sqrt(260 ** 2 - dy ** 2)} ry={38} />
        ))}
      </g>
    </svg>
  );
}
