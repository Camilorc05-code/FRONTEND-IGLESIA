import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const COLORES = {
  azul: '#3E52C3',
  rojo: '#E1011D',
  gold: '#D4A017',
  verde: '#16a34a',
  ink: '#0A2A57',
  gris: '#94a3b8',
};

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/dashboard/estadisticas')
      .then(({ data }) => setDatos(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="p-8 text-ink/40">Cargando estadísticas…</div>;
  if (!datos) return <div className="p-8 text-ink/40">Error al cargar datos.</div>;

  const { resumen, graficas } = datos;

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-display text-2xl text-ink mb-1">Resumen</h1>
      <p className="text-ink/50 text-sm mb-8">Estado actual de la iglesia</p>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Tarjeta label="Miembros" valor={resumen.totalMiembros} color="text-azul" icono="👤" />
        <Tarjeta label="Visitas" valor={resumen.totalVisitas} color="text-verde" icono="📋" />
        <Tarjeta label="Citas" valor={resumen.totalCitas} color="text-rojo" icono="📅" />
        <Tarjeta label="Bebés" valor={resumen.totalBebes} color="text-gold-dark" icono="👶" />
      </div>

      {/* Estado de citas */}
      <div className="bg-white rounded-2xl border border-line p-6 mb-8">
        <h2 className="font-display text-lg text-ink mb-4">Estado de Citas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EstadoCita label="Pendientes" valor={resumen.citasPendientes} color="bg-amber-100 text-amber-700" />
          <EstadoCita label="Confirmadas" valor={resumen.citasConfirmadas} color="bg-azul/10 text-azul" />
          <EstadoCita label="Completadas" valor={resumen.citasCompletadas} color="bg-verde/10 text-verde" />
          <EstadoCita label="Canceladas" valor={resumen.citasCanceladas} color="bg-rojo/10 text-rojo" />
        </div>
      </div>

      {/* Gráfica de barras — actividad por mes */}
      <div className="bg-white rounded-2xl border border-line p-6 mb-8">
        <h2 className="font-display text-lg text-ink mb-4">Actividad de los últimos 12 meses</h2>
        <GraficaBarras datos={graficas.meses} />
        <div className="flex gap-6 mt-4 justify-center text-xs text-ink/60">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-azul inline-block" /> Miembros</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rojo inline-block" /> Visitas</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gold inline-block" /> Citas</span>
        </div>
      </div>

      {/* Gráfica de dona — estados de citas */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-line p-6">
          <h2 className="font-display text-lg text-ink mb-4">Distribución de Citas</h2>
          <GraficaDona datos={[
            { label: 'Pendientes', valor: resumen.citasPendientes, color: '#D4A017' },
            { label: 'Confirmadas', valor: resumen.citasConfirmadas, color: '#3E52C3' },
            { label: 'Completadas', valor: resumen.citasCompletadas, color: '#16a34a' },
            { label: 'Canceladas', valor: resumen.citasCanceladas, color: '#E1011D' },
          ]} />
        </div>
        <div className="bg-white rounded-2xl border border-line p-6">
          <h2 className="font-display text-lg text-ink mb-4">Comparativa Mensual</h2>
          <GraficaLineas datos={graficas.meses} />
        </div>
      </div>
    </div>
  );
}

function Tarjeta({ label, valor, color, icono }) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-ink/60">{label}</p>
        <span className="text-lg">{icono}</span>
      </div>
      <p className={`font-display text-3xl ${color}`}>{valor}</p>
    </div>
  );
}

function EstadoCita({ label, valor, color }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-center ${color}`}>
      <p className="font-display text-2xl">{valor}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}

function GraficaBarras({ datos }) {
  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 160;
  const anioBarra = 8;
  const grupoAnio = anioBarra * 3 + 6;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${datos.length * grupoAnio + 20} ${alto + 30}`} className="w-full max-w-2xl" style={{ minWidth: 400 }}>
        {/* Línea base */}
        <line x1="10" y1={alto} x2={datos.length * grupoAnio + 10} y2={alto} stroke="#e2e8f0" strokeWidth="1" />

        {datos.map((d, i) => {
          const x = 14 + i * grupoAnio;
          const hM = (d.miembros / maximo) * (alto - 10);
          const hV = (d.visitas / maximo) * (alto - 10);
          const hC = (d.citas / maximo) * (alto - 10);

          return (
            <g key={i}>
              <rect x={x} y={alto - hM} width={anioBarra} height={hM} fill={COLORES.azul} rx="2" />
              <rect x={x + anioBarra + 1} y={alto - hV} width={anioBarra} height={hV} fill={COLORES.rojo} rx="2" />
              <rect x={x + (anioBarra + 1) * 2} y={alto - hC} width={anioBarra} height={hC} fill={COLORES.gold} rx="2" />
              <text x={x + anioBarra + 1} y={alto + 14} textAnchor="middle" fontSize="7" fill="#94a3b8">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GraficaDona({ datos }) {
  const total = datos.reduce((a, d) => a + d.valor, 0);
  if (total === 0) return <p className="text-ink/40 text-sm text-center py-8">Sin datos</p>;

  const radio = 60;
  const cx = 80;
  const cy = 80;
  let anguloActual = -90;

  const segmentos = datos.filter((d) => d.valor > 0).map((d) => {
    const porcentaje = d.valor / total;
    const angulo = porcentaje * 360;
    const inicio = anguloActual;
    anguloActual += angulo;
    const fin = anguloActual;

    const radInicio = (inicio * Math.PI) / 180;
    const radFin = (fin * Math.PI) / 180;
    const x1 = cx + radio * Math.cos(radInicio);
    const y1 = cy + radio * Math.sin(radInicio);
    const x2 = cx + radio * Math.cos(radFin);
    const y2 = cy + radio * Math.sin(radFin);
    const largeArc = angulo > 180 ? 1 : 0;

    return { ...d, porcentaje, path: `M ${cx} ${cy} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" width="160" height="160">
        {segmentos.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r="35" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="bold" fill={COLORES.ink}>{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
      </svg>
      <div className="space-y-2 text-sm">
        {datos.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
            <span className="text-ink/70">{d.label}</span>
            <span className="font-mono text-ink font-medium">{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraficaLineas({ datos }) {
  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 120;
  const ancho = 400;
  const paso = ancho / (datos.length - 1 || 1);

  function camino(vals) {
    return vals.map((v, i) => {
      const x = i * paso;
      const y = alto - (v / maximo) * (alto - 10);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${ancho} ${alto + 20}`} className="w-full" style={{ minWidth: 300 }}>
        <line x1="0" y1={alto} x2={ancho} y2={alto} stroke="#e2e8f0" strokeWidth="1" />
        <path d={camino(datos.map((d) => d.miembros))} fill="none" stroke={COLORES.azul} strokeWidth="2" />
        <path d={camino(datos.map((d) => d.visitas))} fill="none" stroke={COLORES.rojo} strokeWidth="2" />
        <path d={camino(datos.map((d) => d.citas))} fill="none" stroke={COLORES.gold} strokeWidth="2" />
        {datos.filter((_, i) => i % 2 === 0).map((d, i) => (
          <text key={i} x={i * 2 * paso} y={alto + 14} textAnchor="middle" fontSize="7" fill="#94a3b8">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}
