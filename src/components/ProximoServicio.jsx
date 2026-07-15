import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime12h } from '../utils/formatTime';

const DIAS_INDEX = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6,
};

function proximaFecha(diaSemana, horaInicio) {
  const idx = DIAS_INDEX[diaSemana];
  if (idx === undefined || !horaInicio) return null;
  const [h, m] = horaInicio.split(':').map(Number);
  const ahora = new Date();

  for (let d = 0; d <= 7; d++) {
    const candidato = new Date(ahora);
    candidato.setDate(ahora.getDate() + d);
    candidato.setHours(h, m, 0, 0);
    if (candidato.getDay() === idx && candidato.getTime() > ahora.getTime()) {
      return candidato;
    }
  }
  return null;
}

function calcularProximo(servicios) {
  let mejor = null;
  for (const s of servicios) {
    const fecha = proximaFecha(s.diaSemana, s.horaInicio);
    if (fecha && (!mejor || fecha < mejor.fecha)) {
      mejor = { fecha, servicio: s };
    }
  }
  return mejor;
}

function diffPartes(target) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const dias = Math.floor(diff / 86400000);
  const horas = Math.floor((diff % 86400000) / 3600000);
  const min = Math.floor((diff % 3600000) / 60000);
  const seg = Math.floor((diff % 60000) / 1000);
  return { dias, horas, min, seg };
}

export function ProximoServicio({ servicios }) {
  const proximo = useMemo(() => calcularProximo(servicios), [servicios]);
  const [partes, setPartes] = useState(() => (proximo ? diffPartes(proximo.fecha) : null));

  useEffect(() => {
    if (!proximo) return;
    const id = setInterval(() => setPartes(diffPartes(proximo.fecha)), 1000);
    return () => clearInterval(id);
  }, [proximo]);

  if (!proximo || !partes) return null;

  const unidades = [
    { valor: partes.dias, label: 'días' },
    { valor: partes.horas, label: 'horas' },
    { valor: partes.min, label: 'min' },
    { valor: partes.seg, label: 'seg' },
  ];

  return (
    <div className="inline-flex flex-col items-center gap-2.5 md:gap-3 rounded-2xl border border-line bg-white/80 backdrop-blur px-4 py-4 md:px-6 md:py-5 shadow-brand-sm max-w-full">
      <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-azul text-center px-1">
        Próximo servicio · {proximo.servicio.nombre} · {formatTime12h(proximo.servicio.horaInicio)}
      </p>
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {unidades.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="flex flex-col items-center">
              <motion.span
                key={u.valor}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-xl sm:text-2xl md:text-3xl text-ink tabular-nums w-8 sm:w-10 text-center"
              >
                {String(u.valor).padStart(2, '0')}
              </motion.span>
              <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-wide text-ink/40">{u.label}</span>
            </div>
            {i < unidades.length - 1 && <span className="text-gold text-lg md:text-xl -mt-3">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
