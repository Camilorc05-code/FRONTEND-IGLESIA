import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { api } from '../../api/client';

const C = {
  azul: '#3E52C3',
  rojo: '#E1011D',
  gold: '#D4A017',
  verde: '#16a34a',
  ink: '#0A2A57',
  surface: '#f1f5f9',
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

  if (cargando) return <LoadingSpinner />;
  if (!datos) return <div className="p-8 text-center text-ink/40">Error al cargar datos.</div>;

  const { resumen, graficas } = datos;
  const growth = computeGrowth(graficas.meses);
  const totalCitas =
    resumen.citasPendientes +
    resumen.citasConfirmadas +
    resumen.citasCompletadas +
    resumen.citasCanceladas;

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-ink/50 text-sm mt-1 font-body">Resumen general de la iglesia</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Tarjeta icono={<IconoMiembro />} label="Miembros" valor={resumen.totalMiembros} color={C.azul} colorBg={C.azul} growth={growth?.miembros} delay={0} />
          <Tarjeta icono={<IconoNuevos />} label="Nuevos" valor={resumen.totalVisitas} color={C.verde} colorBg={C.verde} growth={growth?.visitas} delay={1} />
          <Tarjeta icono={<IconoCita />} label="Citas" valor={resumen.totalCitas} color={C.rojo} colorBg={C.rojo} growth={growth?.citas} delay={2} />
          <Tarjeta icono={<IconoBebe />} label="Bebés" valor={resumen.totalBebes} color={C.gold} colorBg={C.gold} delay={3} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-line p-6"
        >
          <h2 className="font-display text-lg font-semibold text-ink mb-5">Estado de Citas</h2>
          <div className="space-y-4">
            <EstadoCitaBar label="Pendientes" valor={resumen.citasPendientes} total={totalCitas} color={C.gold} />
            <EstadoCitaBar label="Confirmadas" valor={resumen.citasConfirmadas} total={totalCitas} color={C.azul} />
            <EstadoCitaBar label="Completadas" valor={resumen.citasCompletadas} total={totalCitas} color={C.verde} />
            <EstadoCitaBar label="Canceladas" valor={resumen.citasCanceladas} total={totalCitas} color={C.rojo} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-line p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Actividad Mensual</h2>
            <div className="flex gap-4 text-xs text-ink/60 font-body">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.azul }} /> Miembros</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.verde }} /> Nuevos</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.gold }} /> Citas</span>
            </div>
          </div>
          <GraficaBarras datos={graficas.meses} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-line p-6"
          >
            <h2 className="font-display text-lg font-semibold text-ink mb-6">Distribución de Citas</h2>
            <GraficaDona datos={[
              { label: 'Pendientes', valor: resumen.citasPendientes, color: C.gold },
              { label: 'Confirmadas', valor: resumen.citasConfirmadas, color: C.azul },
              { label: 'Completadas', valor: resumen.citasCompletadas, color: C.verde },
              { label: 'Canceladas', valor: resumen.citasCanceladas, color: C.rojo },
            ]} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-line p-6"
          >
            <h2 className="font-display text-lg font-semibold text-ink mb-6">Tendencia</h2>
            <GraficaLineas datos={graficas.meses} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function computeGrowth(meses) {
  if (!meses || meses.length < 2) return null;
  const last = meses[meses.length - 1];
  const prev = meses[meses.length - 2];
  function pct(field) {
    if (prev[field] === 0) return last[field] > 0 ? 100 : 0;
    return ((last[field] - prev[field]) / prev[field]) * 100;
  }
  return { miembros: pct('miembros'), visitas: pct('visitas'), citas: pct('citas') };
}

/* ─── Loading ─── */
function LoadingSpinner() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-azul border-t-transparent rounded-full animate-spin" />
        <span className="text-ink/40 text-sm font-body">Cargando estadísticas…</span>
      </div>
    </div>
  );
}

/* ─── Growth Badge ─── */
function GrowthBadge({ value }) {
  if (value == null || value === 0) return null;
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
    >
      {up ? (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor"><path d="M5 1L9 7H1L5 1Z" /></svg>
      ) : (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor"><path d="M5 9L1 3H9L5 9Z" /></svg>
      )}
      {Math.abs(Math.round(value))}%
    </span>
  );
}

/* ─── Tarjeta ─── */
function Tarjeta({ icono, label, valor, color, colorBg, growth, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || valor === 0) return;
    let start = 0;
    const duration = 800;
    const steps = Math.min(50, valor);
    const increment = valor / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= valor) { start = valor; clearInterval(timer); }
      setCount(Math.round(start));
    }, interval);
    return () => clearInterval(timer);
  }, [valor, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-line p-5 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${colorBg}12` }}
        >
          {icono}
        </div>
        <p className="text-sm text-ink/60 font-medium font-body">{label}</p>
      </div>
      <div className="flex items-end gap-2">
        <p className="font-display text-3xl font-bold leading-none" style={{ color }}>{count}</p>
        <div className="pb-0.5">
          <GrowthBadge value={growth} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Estado Cita Bar ─── */
function EstadoCitaBar({ label, valor, total, color }) {
  const pct = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 shrink-0">
        <p className="text-sm font-medium text-ink/70 font-body">{label}</p>
        <p className="text-xs text-ink/40 font-body">{valor}</p>
      </div>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-ink/50 w-11 text-right font-body">{Math.round(pct)}%</span>
    </div>
  );
}

/* ─── Gráfica de barras ─── */
function GraficaBarras({ datos }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);

  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 200;
  const barW = 10;
  const gaps = 3;
  const grupoW = barW * 3 + gaps * 2;
  const totalW = Math.max(datos.length * (grupoW + 14) + 20, 450);
  const startX = 14;

  function track(e) {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="overflow-x-auto -mx-2 px-2">
        <svg viewBox={`0 0 ${totalW} ${alto + 30}`} className="w-full" style={{ minWidth: totalW }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = alto - pct * (alto - 20);
            const val = Math.round(maximo * pct);
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={totalW} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '4 4'} />
                <text x="-4" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontFamily="Work Sans">{val}</text>
              </g>
            );
          })}

          {datos.map((d, i) => {
            const cx = startX + i * (grupoW + 14) + grupoW / 2;
            const hM = (d.miembros / maximo) * (alto - 20);
            const hV = (d.visitas / maximo) * (alto - 20);
            const hC = (d.citas / maximo) * (alto - 20);
            const isH = hover?.idx === i;

            return (
              <g
                key={i}
                onMouseEnter={(e) => { const p = track(e); if (p) setHover({ idx: i, ...p }); }}
                onMouseMove={(e) => { const p = track(e); if (p) setHover((h) => h ? { ...h, ...p } : null); }}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {isH && (
                  <rect x={cx - grupoW / 2 - 2} y={0} width={grupoW + 4} height={alto} fill={C.azul} opacity="0.04" rx="4" />
                )}
                <rect x={cx - barW * 1.5 - gaps} y={alto - hM} width={barW} height={hM} fill={C.azul} rx="2" opacity={isH ? 1 : 0.85}>
                  <animate attributeName="height" from="0" to={hM} dur="0.6s" fill="freeze" />
                  <animate attributeName="y" from={alto} to={alto - hM} dur="0.6s" fill="freeze" />
                </rect>
                <rect x={cx - barW / 2} y={alto - hV} width={barW} height={hV} fill={C.verde} rx="2" opacity={isH ? 1 : 0.85}>
                  <animate attributeName="height" from="0" to={hV} dur="0.6s" begin="0.1s" fill="freeze" />
                  <animate attributeName="y" from={alto} to={alto - hV} dur="0.6s" begin="0.1s" fill="freeze" />
                </rect>
                <rect x={cx + barW / 2 + gaps} y={alto - hC} width={barW} height={hC} fill={C.gold} rx="2" opacity={isH ? 1 : 0.85}>
                  <animate attributeName="height" from="0" to={hC} dur="0.6s" begin="0.2s" fill="freeze" />
                  <animate attributeName="y" from={alto} to={alto - hC} dur="0.6s" begin="0.2s" fill="freeze" />
                </rect>
                <text x={cx} y={alto + 14} textAnchor="middle" fontSize="8" fill={isH ? C.ink : '#94a3b8'} fontFamily="Work Sans" fontWeight={isH ? '600' : '400'}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hover && (
        <div
          className="absolute z-20 bg-white rounded-xl shadow-lg border border-line/60 px-3 py-2.5 text-xs pointer-events-none"
          style={{
            left: Math.min(hover.x, (wrapRef.current?.offsetWidth || 300) - 150),
            top: hover.y - 12,
            transform: 'translateY(-100%)',
          }}
        >
          <p className="font-semibold text-ink mb-1 font-body">{datos[hover.idx].label}</p>
          <div className="space-y-0.5 font-body">
            <Row color={C.azul} label="Miembros" value={datos[hover.idx].miembros} />
            <Row color={C.verde} label="Nuevos" value={datos[hover.idx].visitas} />
            <Row color={C.gold} label="Citas" value={datos[hover.idx].citas} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-sm shrink-0 inline-block" style={{ background: color }} />
      <span className="text-ink/50">{label}:</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

/* ─── Dona ─── */
function GraficaDona({ datos }) {
  const [hovered, setHovered] = useState(null);
  const total = datos.reduce((a, d) => a + d.valor, 0);
  if (total === 0) return <p className="text-ink/40 text-sm text-center py-8 font-body">Sin datos</p>;

  const radio = 70;
  const radioInterior = 45;
  const cx = 90;
  const cy = 90;
  let anguloActual = -90;

  const segmentos = datos.filter((d) => d.valor > 0).map((d) => {
    const porcentaje = d.valor / total;
    const angulo = Math.max(porcentaje * 360, 0.5);
    const inicio = anguloActual;
    anguloActual += angulo;
    const midAngle = ((inicio + anguloActual) / 2 * Math.PI) / 180;

    const radI = (inicio * Math.PI) / 180;
    const radF = (anguloActual * Math.PI) / 180;
    const x1 = cx + radio * Math.cos(radI);
    const y1 = cy + radio * Math.sin(radI);
    const x2 = cx + radio * Math.cos(radF);
    const y2 = cy + radio * Math.sin(radF);
    const ix1 = cx + radioInterior * Math.cos(radF);
    const iy1 = cy + radioInterior * Math.sin(radF);
    const ix2 = cx + radioInterior * Math.cos(radI);
    const iy2 = cy + radioInterior * Math.sin(radI);
    const large = angulo > 180 ? 1 : 0;

    const path = `M ${x1} ${y1} A ${radio} ${radio} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${radioInterior} ${radioInterior} 0 ${large} 0 ${ix2} ${iy2} Z`;
    const tx = 4 * Math.cos(midAngle);
    const ty = 4 * Math.sin(midAngle);

    return { ...d, porcentaje, path, tx, ty };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[180px]">
        <svg viewBox="0 0 180 180" className="w-full h-auto">
          {segmentos.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              style={{
                opacity: hovered === null ? 0.85 : hovered === i ? 1 : 0.45,
                transform: hovered === i ? `translate(${s.tx}px,${s.ty}px) scale(1.05)` : 'translate(0,0) scale(1)',
                transformOrigin: `${cx}px ${cy}px`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={radioInterior - 2} fill="white" />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="bold" fill={C.ink} fontFamily="Fraunces">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Work Sans">total</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {datos.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-sm shrink-0 inline-block" style={{ backgroundColor: d.color }} />
            <div>
              <p className="text-xs text-ink/50 font-body">{d.label}</p>
              <p className="text-sm font-semibold text-ink font-body">
                {d.valor}{' '}
                <span className="text-ink/40 font-normal">
                  ({total > 0 ? Math.round((d.valor / total) * 100) : 0}%)
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Líneas ─── */
function GraficaLineas({ datos }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);

  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 160;
  const padL = 20;
  const padR = 10;
  const w = 500;
  const usable = w - padL - padR;
  const paso = datos.length > 1 ? usable / (datos.length - 1) : usable;

  const hayDatos = datos.some((d) => d.miembros > 0 || d.visitas > 0 || d.citas > 0);
  if (!hayDatos) {
    return <div className="flex items-center justify-center h-40 text-ink/30 text-sm font-body">Sin datos de tendencia aún</div>;
  }

  function pts(vals) {
    if (vals.length < 2) return `M${padL},${alto - (vals[0] / maximo) * (alto - 20)}`;
    const points = vals.map((v, i) => ({ x: padL + i * paso, y: alto - (v / maximo) * (alto - 20) }));
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const t = 0.3;
      d += `C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
    }
    return d;
  }

  function fill(vals) {
    return `${pts(vals)}L${padL + (vals.length - 1) * paso},${alto}L${padL},${alto}Z`;
  }

  const series = [
    { key: 'miembros', label: 'Miembros', color: C.azul },
    { key: 'visitas', label: 'Nuevos', color: C.verde },
    { key: 'citas', label: 'Citas', color: C.gold },
  ];

  function track(e) {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDotEnter(key, idx, e) {
    const p = track(e);
    if (p) setHover({ seriesKey: key, idx, ...p });
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="overflow-x-auto -mx-2 px-2">
        <svg viewBox={`0 0 ${w} ${alto + 20}`} className="w-full" style={{ minWidth: 350 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = alto - pct * (alto - 20);
            return <line key={i} x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '4 4'} />;
          })}

          {series.map(({ key, color }) => (
            <g key={key}>
              <path d={fill(datos.map((d) => d[key]))} fill={color} opacity="0.06" />
              <path d={pts(datos.map((d) => d[key]))} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}

          {hover && (
            <line
              x1={padL + hover.idx * paso}
              y1={0}
              x2={padL + hover.idx * paso}
              y2={alto}
              stroke={C.ink}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              opacity="0.2"
            />
          )}

          {series.map(({ key, color }) =>
            datos.map((d, i) => {
              const dotX = padL + i * paso;
              const dotY = alto - (d[key] / maximo) * (alto - 20);
              const isActive = hover?.idx === i && hover?.seriesKey === key;
              const colActive = hover?.idx === i;
              return (
                <g key={`${key}-${i}`}>
                  <circle cx={dotX} cy={dotY} r="14" fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => onDotEnter(key, i, e)}
                    onMouseMove={(e) => { const p = track(e); if (p) setHover((h) => h ? { ...h, ...p } : null); }}
                    onMouseLeave={() => setHover(null)}
                  />
                  <circle
                    cx={dotX} cy={dotY}
                    r={isActive ? 5.5 : colActive ? 4 : 3}
                    fill={isActive ? color : 'white'}
                    stroke={color}
                    strokeWidth={isActive ? 3 : 2.5}
                    style={{ transition: 'all 0.15s ease', pointerEvents: 'none' }}
                  />
                </g>
              );
            })
          )}

          {datos.map((d, i) => (
            <text key={i} x={padL + i * paso} y={alto + 14} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Work Sans">{d.label}</text>
          ))}
        </svg>
      </div>

      {hover && (
        <div
          className="absolute z-20 bg-white rounded-xl shadow-lg border border-line/60 px-3 py-2.5 text-xs pointer-events-none"
          style={{
            left: Math.min(Math.max(hover.x, 80), (wrapRef.current?.offsetWidth || 350) - 150),
            top: hover.y - 12,
            transform: 'translateY(-100%)',
          }}
        >
          <p className="font-semibold text-ink mb-1 font-body">{datos[hover.idx].label}</p>
          <div className="space-y-0.5 font-body">
            {series.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: color }} />
                <span className="text-ink/50">{label}:</span>
                <span className={`font-semibold ${hover.seriesKey === key ? 'text-ink' : 'text-ink/70'}`}>
                  {datos[hover.idx][key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Iconos SVG ─── */
function IconoMiembro() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconoNuevos() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
function IconoCita() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.rojo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconoBebe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
