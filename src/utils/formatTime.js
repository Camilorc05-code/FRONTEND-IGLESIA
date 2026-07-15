/**
 * Convierte una hora en formato 24h ("14:30") a formato 12h con AM/PM ("2:30 p.m.").
 * Si el input es vacío o inválido, retorna una cadena vacía.
 */
export function formatTime12h(time24) {
  if (!time24 || typeof time24 !== 'string') return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Formatea un rango de horas ("09:00" – "12:00") a 12h.
 */
export function formatTimeRange12h(horaInicio, horaFin) {
  const inicio = formatTime12h(horaInicio);
  const fin = formatTime12h(horaFin);
  if (!inicio) return '';
  if (!fin) return inicio;
  return `${inicio} – ${fin}`;
}

/**
 * Formatea las horas disponibles para citas en formato 12h.
 * Retorna un array de { value, label }.
 */
export function horasDisponibles12h(horas) {
  return horas.map((h) => ({ value: h, label: formatTime12h(h) }));
}
