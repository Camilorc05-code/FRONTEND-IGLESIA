import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { api } from '../../api/client';

const C = { azul: '#3E52C3', rojo: '#E1011D', gold: '#D4A017', verde: '#16a34a', ink: '#0A2A57', gris: '#94a3b8', surface: '#f1f5f9' };

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/dashboard/estadisticas')
      .then(({ data }) => setDatos(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="p-8 flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-azul border-t-transparent rounded-full animate-spin" />
      <span className="text-ink/40 text-sm">Cargando estadísticas…</span>
    </div>
  );
  if (!datos) return <div className="p-8 text-ink/40">Error al cargar datos.</div>;

  const { resumen, graficas } = datos;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Resumen</h1>
        <p className="text-ink/50 text-sm">Estado actual de la iglesia</p>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tarjeta animacion={0} icono={<IconoMiembro />} label="Miembros" valor={resumen.totalMiembros} color={C.azul} bg="bg-azul/5" />
        <Tarjeta animacion={1} icono={<IconoNuevos />} label="Nuevos" valor={resumen.totalVisitas} color={C.verde} bg="bg-verde/5" />
        <Tarjeta animacion={2} icono={<IconoCita />} label="Citas" valor={resumen.totalCitas} color={C.rojo} bg="bg-rojo/5" />
        <Tarjeta animacion={3} icono={<IconoBebe />} label="Bebés" valor={resumen.totalBebes} color={C.gold} bg="bg-gold/5" />
      </div>

      {/* Estado de citas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-line p-6"
      >
        <h2 className="font-display text-base font-semibold text-ink mb-4">Estado de Citas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EstadoCita label="Pendientes" valor={resumen.citasPendientes} color="#D4A017" />
          <EstadoCita label="Confirmadas" valor={resumen.citasConfirmadas} color="#3E52C3" />
          <EstadoCita label="Completadas" valor={resumen.citasCompletadas} color="#16a34a" />
          <EstadoCita label="Canceladas" valor={resumen.citasCanceladas} color="#E1011D" />
        </div>
      </motion.div>

      {/* Gráfica de barras */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-line p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-base font-semibold text-ink">Actividad Mensual</h2>
          <div className="flex gap-4 text-xs text-ink/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.azul }} /> Miembros</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.verde }} /> Nuevos</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.gold }} /> Citas</span>
          </div>
        </div>
        <GraficaBarras datos={graficas.meses} />
      </motion.div>

      {/* Dona + Líneas */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-line p-6"
        >
          <h2 className="font-display text-base font-semibold text-ink mb-6">Distribución de Citas</h2>
          <GraficaDona datos={[
            { label: 'Pendientes', valor: resumen.citasPendientes, color: '#D4A017' },
            { label: 'Confirmadas', valor: resumen.citasConfirmadas, color: '#3E52C3' },
            { label: 'Completadas', valor: resumen.citasCompletadas, color: '#16a34a' },
            { label: 'Canceladas', valor: resumen.citasCanceladas, color: '#E1011D' },
          ]} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-line p-6"
        >
          <h2 className="font-display text-base font-semibold text-ink mb-6">Tendencia</h2>
          <GraficaLineas datos={graficas.meses} />
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Tarjetas resumen ─── */
function Tarjeta({ icono, label, valor, color, bg, animacion }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = valor;
    if (end === 0) return;
    const dur = 800;
    const paso = Math.max(1, Math.floor(end / 40));
    const intervalo = dur / (end / paso);
    const timer = setInterval(() => {
      start += paso;
      if (start >= end) { start = end; clearInterval(timer); }
      setCount(start);
    }, intervalo);
    return () => clearInterval(timer);
  }, [valor, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animacion * 0.1 }}
      className="bg-white rounded-2xl border border-line p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          {icono}
        </div>
        <p className="text-sm text-ink/60 font-medium">{label}</p>
      </div>
      <p className="font-display text-3xl font-bold" style={{ color }}>{count}</p>
    </motion.div>
  );
}

/* ─── Estado cita ─── */
function EstadoCita({ label, valor, color }) {
  return (
    <div className="rounded-xl p-4 text-center border border-line/50 hover:border-line transition-colors">
      <p className="font-display text-2xl font-bold" style={{ color }}>{valor}</p>
      <p className="text-xs text-ink/50 mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ─── Gráfica de barras ─── */
function GraficaBarras({ datos }) {
  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 200;
  const leftPad = 8;
  const rightPad = 12;
  const anchoTotal = 600;
  const espacioGrupo = (anchoTotal - leftPad - rightPad) / datos.length;
  const barW = Math.min(espacioGrupo * 0.22, 12);
  const gaps = 3;

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <svg viewBox={`0 0 ${anchoTotal} ${alto + 35}`} className="w-full" style={{ minWidth: 450 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = alto - pct * (alto - 20);
          const val = Math.round(maximo * pct);
          return (
            <g key={i}>
              <line x1={leftPad} y1={y} x2={anchoTotal - rightPad} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '4 4'} />
              <text x={leftPad - 2} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">{val}</text>
            </g>
          );
        })}

        {/* Barras */}
        {datos.map((d, i) => {
          const x = leftPad + i * espacioGrupo + espacioGrupo / 2;
          const bw = barW;
          const hM = (d.miembros / maximo) * (alto - 20);
          const hV = (d.visitas / maximo) * (alto - 20);
          const hC = (d.citas / maximo) * (alto - 20);

          return (
            <g key={i}>
              <rect x={x - bw * 1.5 - gaps} y={alto - hM} width={bw} height={hM} fill={C.azul} rx="3" opacity="0.9">
                <animate attributeName="height" from="0" to={hM} dur="0.6s" fill="freeze" />
                <animate attributeName="y" from={alto} to={alto - hM} dur="0.6s" fill="freeze" />
              </rect>
              <rect x={x - bw / 2} y={alto - hV} width={bw} height={hV} fill={C.verde} rx="3" opacity="0.9">
                <animate attributeName="height" from="0" to={hV} dur="0.6s" begin="0.1s" fill="freeze" />
                <animate attributeName="y" from={alto} to={alto - hV} dur="0.6s" begin="0.1s" fill="freeze" />
              </rect>
              <rect x={x + bw / 2 + gaps} y={alto - hC} width={bw} height={hC} fill={C.gold} rx="3" opacity="0.9">
                <animate attributeName="height" from="0" to={hC} dur="0.6s" begin="0.2s" fill="freeze" />
                <animate attributeName="y" from={alto} to={alto - hC} dur="0.6s" begin="0.2s" fill="freeze" />
              </rect>
              <text x={x} y={alto + 16} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Work Sans">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Dona ─── */
function GraficaDona({ datos }) {
  const total = datos.reduce((a, d) => a + d.valor, 0);
  if (total === 0) return <p className="text-ink/40 text-sm text-center py-8">Sin datos</p>;

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

    return { ...d, porcentaje, path };
  });

  return (
    <div className="flex items-center justify-center gap-8">
      <svg viewBox="0 0 180 180" width="180" height="180">
        {segmentos.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity="0.9">
            <animate attributeName="opacity" from="0" to="0.9" dur="0.5s" begin={`${i * 0.1}s`} fill="freeze" />
          </path>
        ))}
        <circle cx={cx} cy={cy} r={radioInterior - 2} fill="white" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="bold" fill={C.ink}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
      </svg>
      <div className="space-y-3">
        {datos.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <div>
              <p className="text-xs text-ink/50">{d.label}</p>
              <p className="text-sm font-semibold text-ink">{d.valor} <span className="text-ink/40 font-normal">({total > 0 ? Math.round((d.valor / total) * 100) : 0}%)</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Líneas ─── */
function GraficaLineas({ datos }) {
  const maximo = Math.max(...datos.map((d) => Math.max(d.miembros, d.visitas, d.citas)), 1);
  const alto = 160;
  const leftPad = 8;
  const rightPad = 12;
  const ancho = 500;
  const paso = (ancho - leftPad - rightPad) / (datos.length - 1 || 1);

  function camino(vals) {
    return vals.map((v, i) => {
      const x = leftPad + i * paso;
      const y = alto - (v / maximo) * (alto - 20);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  function area(vals) {
    const line = vals.map((v, i) => {
      const x = leftPad + i * paso;
      const y = alto - (v / maximo) * (alto - 20);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return `${line} L ${leftPad + (vals.length - 1) * paso} ${alto} L ${leftPad} ${alto} Z`;
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <svg viewBox={`0 0 ${ancho} ${alto + 20}`} className="w-full" style={{ minWidth: 350 }}>
        {/* Grid */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = alto - pct * (alto - 20);
          return <line key={i} x1={leftPad} y1={y} x2={ancho - rightPad} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '4 4'} />;
        })}

        {/* Áreas semitransparentes */}
        <path d={area(datos.map((d) => d.miembros))} fill={C.azul} opacity="0.08" />
        <path d={area(datos.map((d) => d.visitas))} fill={C.verde} opacity="0.08" />
        <path d={area(datos.map((d) => d.citas))} fill={C.gold} opacity="0.08" />

        {/* Líneas */}
        <path d={camino(datos.map((d) => d.miembros))} fill="none" stroke={C.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={camino(datos.map((d) => d.visitas))} fill="none" stroke={C.verde} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={camino(datos.map((d) => d.citas))} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Puntos */}
        {datos.map((d, i) => {
          const x = leftPad + i * paso;
          return (
            <g key={i}>
              <circle cx={x} cy={alto - (d.miembros / maximo) * (alto - 20)} r="3" fill="white" stroke={C.azul} strokeWidth="2" />
              <circle cx={x} cy={alto - (d.visitas / maximo) * (alto - 20)} r="3" fill="white" stroke={C.verde} strokeWidth="2" />
              <circle cx={x} cy={alto - (d.citas / maximo) * (alto - 20)} r="3" fill="white" stroke={C.gold} strokeWidth="2" />
            </g>
          );
        })}

        {/* Labels — solo cada 2 meses para no encimar */}
        {datos.filter((_, i) => i % 2 === 0).map((d, idx) => (
          <text key={idx} x={leftPad + (idx * 2) * paso} y={alto + 14} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Work Sans">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Iconos SVG ─── */
function IconoMiembro() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconoNuevos() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
}
function IconoCita() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.rojo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconoBebe() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
}
