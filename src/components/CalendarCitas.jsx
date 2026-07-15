import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatTime12h } from '../utils/formatTime';

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const HORAS_DISPONIBLES = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

function diasEnMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}

function primerDiaSemana(anio, mes) {
  const d = new Date(anio, mes, 1).getDay();
  return d === 0 ? 6 : d - 1; // Lunes = 0
}

export default function CalendarCitas({ pastorId, onSelectSlot, modoAdmin = false }) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setMesActualAnio] = useState(hoy.getFullYear());
  const [citas, setCitas] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const mesStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}`;

  useEffect(() => {
    setCargando(true);
    const params = { mes: mesStr };
    if (pastorId) params.pastorId = pastorId;
    api.get('/citas/ocupados', { params })
      .then((r) => setCitas(r.data))
      .catch(() => setCitas([]))
      .finally(() => setCargando(false));
  }, [mesStr, pastorId]);

  function cambiarMes(delta) {
    let nuevoMes = mesActual + delta;
    let nuevoAnio = anioActual;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; }
    // No ir al pasado
    if (nuevoAnio < hoy.getFullYear() || (nuevoAnio === hoy.getFullYear() && nuevoMes < hoy.getMonth())) return;
    setMesActual(nuevoMes);
    setMesActualAnio(nuevoAnio);
    setDiaSeleccionado(null);
  }

  function esPasado(dia) {
    const fecha = new Date(anioActual, mesActual, dia);
    const hoyLimpio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return fecha < hoyLimpio;
  }

  function esHoy(dia) {
    return dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
  }

  function citasDelDia(dia) {
    const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return citas.filter((c) => {
      const fechaCita = new Date(c.fecha).toISOString().split('T')[0];
      return fechaCita === fechaStr;
    });
  }

  function horasOcupadas(dia) {
    return citasDelDia(dia).map((c) => c.hora);
  }

  function seleccionarDia(dia) {
    if (esPasado(dia)) return;
    setDiaSeleccionado(dia === diaSeleccionado ? null : dia);
  }

  const totalDias = diasEnMes(anioActual, mesActual);
  const offset = primerDiaSemana(anioActual, mesActual);
  const slots = [];

  for (let i = 0; i < offset; i++) {
    slots.push(<div key={`empty-${i}`} />);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const ocupadas = horasOcupadas(dia);
    const totalHoras = HORAS_DISPONIBLES.length;
    const libres = totalHoras - ocupadas.length;
    const pasado = esPasado(dia);
    const seleccionado = dia === diaSeleccionado;

    let indicadorColor = 'bg-verde/60';
    if (libres === 0) indicadorColor = 'bg-rojo/60';
    else if (libres <= 3) indicadorColor = 'bg-gold/70';

    slots.push(
      <button
        key={dia}
        onClick={() => seleccionarDia(dia)}
        disabled={pasado}
        className={`relative p-2 rounded-xl text-sm transition-all duration-200 flex flex-col items-center gap-1
          ${pasado ? 'text-ink/25 cursor-not-allowed' : 'cursor-pointer hover:bg-azul/10'}
          ${seleccionado ? 'bg-azul text-white shadow-md ring-2 ring-azul/40' : ''}
          ${esHoy(dia) && !seleccionado ? 'ring-2 ring-gold/50' : ''}
        `}
      >
        <span className={`font-mono text-sm ${seleccionado ? 'text-white' : ''}`}>{dia}</span>
        {!pasado && (
          <span className={`w-2 h-2 rounded-full ${indicadorColor}`} />
        )}
      </button>
    );
  }

  const diaElegido = diaSeleccionado ? citasDelDia(diaSeleccionado) : [];
  const horasLibresDia = diaSeleccionado
    ? HORAS_DISPONIBLES.filter((h) => !horasOcupadas(diaSeleccionado).includes(h))
    : [];

  return (
    <div className="bg-white rounded-2xl border border-line p-5 md:p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => cambiarMes(-1)}
          className="p-2 rounded-lg hover:bg-ink/5 transition-colors text-ink/60 hover:text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="font-display text-lg text-ink">
          {MESES[mesActual]} {anioActual}
        </h3>
        <button
          onClick={() => cambiarMes(1)}
          className="p-2 rounded-lg hover:bg-ink/5 transition-colors text-ink/60 hover:text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-4 text-xs text-ink/50">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-verde/60" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold/70" /> Pocos cupos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rojo/60" /> Lleno
        </span>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-ink/40 py-1">{d}</div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {slots}
      </div>

      {/* Detalle del día seleccionado */}
      {diaSeleccionado && (
        <div className="mt-5 border-t border-line pt-5">
          <h4 className="font-display text-base text-ink mb-3">
            {diaSeleccionado} de {MESES[mesActual]}
            {modoAdmin && diaElegido.length > 0 && (
              <span className="text-sm font-body text-ink/50 ml-2">({diaElegido.length} cita{diaElegido.length !== 1 ? 's' : ''})</span>
            )}
          </h4>

          {/* Citas aceptadas del día */}
          {diaElegido.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-ink/40 uppercase tracking-wide">Horarios ocupados</p>
              {diaElegido.map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-rojo/5 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm text-rojo font-medium">{formatTime12h(c.hora)}</span>
                  <span className="text-sm text-ink/60">{c.nombreSolicitante}</span>
                  {modoAdmin && c.pastor && (
                    <span className="text-xs text-ink/40 ml-auto">con {c.pastor.nombre}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Horas disponibles */}
          {horasLibresDia.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-2">Horarios disponibles</p>
              <div className="flex flex-wrap gap-2">
                {horasLibresDia.map((h) => (
                  <button
                    key={h}
                    onClick={() => onSelectSlot?.({
                      fecha: `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`,
                      hora: h,
                    })}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-verde/10 text-verde-dark hover:bg-verde/20 transition-colors border border-verde/20"
                  >
                    {formatTime12h(h)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {horasLibresDia.length === 0 && diaElegido.length > 0 && (
            <p className="text-sm text-rojo/70 italic">No hay horarios disponibles este día.</p>
          )}
        </div>
      )}

      {cargando && (
        <p className="text-xs text-ink/30 text-center mt-3">Cargando disponibilidad…</p>
      )}
    </div>
  );
}
