import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';

const TIPOS = [
  { value: 'diezmo', label: 'Diezmo', color: '#024293' },
  { value: 'ofrenda', label: 'Ofrenda', color: '#3E52C3' },
  { value: 'donacion', label: 'Donación', color: '#16a34a' },
  { value: 'gasto', label: 'Gasto', color: '#dc2626' },
];

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const ANIOS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

const METODOS = ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Otro'];

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function parseMonto(str) {
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

function formatMontoInput(str) {
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-CO');
}

export default function Contabilidad() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [filtro, setFiltro] = useState({ tipo: '', desde: '', hasta: '' });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ tipo: 'diezmo', monto: '', personaId: '', nombreAnonimo: '', descripcion: '', metodoPago: 'Efectivo', fecha: new Date().toISOString().split('T')[0], notas: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [personaBusqueda, setPersonaBusqueda] = useState('');
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const personaRef = useRef(null);
  const ahora = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(ahora.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(ahora.getFullYear());

  useEffect(() => { cargarResumen(); cargarPersonas(); }, []);
  useEffect(() => { cargarResumen(); setPagina(1); }, [mesSeleccionado, anioSeleccionado]);
  useEffect(() => {
    const desde = `${anioSeleccionado}-${String(mesSeleccionado).padStart(2, '0')}-01`;
    const lastDay = new Date(anioSeleccionado, mesSeleccionado, 0).getDate();
    const hasta = `${anioSeleccionado}-${String(mesSeleccionado).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    setFiltro((f) => ({ ...f, desde, hasta }));
  }, [mesSeleccionado, anioSeleccionado]);
  useEffect(() => { cargarMovimientos(); }, [filtro, pagina]);
  useEffect(() => {
    function handleClickOutside(e) {
      if (personaRef.current && !personaRef.current.contains(e.target)) setShowPersonaDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function cargarResumen() {
    try {
      const { data } = await api.get('/contabilidad/resumen', { params: { mes: mesSeleccionado, anio: anioSeleccionado } });
      setResumen(data);
    } catch {}
  }

  async function cargarPersonas() {
    try {
      const { data } = await api.get('/personas?limit=500');
      setPersonas(data.data || []);
    } catch {}
  }

  async function cargarMovimientos() {
    setCargando(true);
    try {
      const params = { page: pagina, limit: 20 };
      if (filtro.tipo) params.tipo = filtro.tipo;
      if (filtro.desde) params.desde = filtro.desde;
      if (filtro.hasta) params.hasta = filtro.hasta;
      const { data } = await api.get('/contabilidad', { params });
      setMovimientos(data.movimientos || []);
      setTotalPaginas(data.pages || 1);
    } catch {} finally { setCargando(false); }
  }

  async function registrarMovimiento(e) {
    e.preventDefault();
    setError(''); setExito('');
    if (!form.monto || parseMonto(form.monto) <= 0) return setError('Ingresa un monto válido.');
    if (form.tipo !== 'gasto' && !form.personaId && !form.nombreAnonimo) return setError('Selecciona una persona o escribe un nombre anónimo.');
    try {
      const payload = { ...form, monto: parseMonto(form.monto) };
      if (!payload.personaId) payload.personaId = undefined;
      if (editandoId) {
        await api.put(`/contabilidad/${editandoId}`, payload);
        setExito('Movimiento actualizado correctamente.');
      } else {
        await api.post('/contabilidad', payload);
        setExito('Movimiento registrado correctamente.');
      }
      setShowForm(false);
      setEditandoId(null);
      setForm({ tipo: 'diezmo', monto: '', personaId: '', nombreAnonimo: '', descripcion: '', metodoPago: 'Efectivo', fecha: new Date().toISOString().split('T')[0], notas: '' });
      setPersonaBusqueda('');
      cargarResumen();
      cargarMovimientos();
      setTimeout(() => setExito(''), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Error al registrar.'); }
  }

  function editarMovimiento(m) {
    setEditandoId(m.id);
    setForm({
      tipo: m.tipo,
      monto: formatMontoInput(String(m.monto)),
      personaId: m.personaId || '',
      nombreAnonimo: m.nombreAnonimo || '',
      descripcion: m.descripcion || '',
      metodoPago: m.metodoPago || 'Efectivo',
      fecha: m.fecha ? new Date(m.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notas: m.notas || '',
    });
    setPersonaBusqueda('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setShowForm(false);
    setForm({ tipo: 'diezmo', monto: '', personaId: '', nombreAnonimo: '', descripcion: '', metodoPago: 'Efectivo', fecha: new Date().toISOString().split('T')[0], notas: '' });
    setPersonaBusqueda('');
    setError('');
  }

  async function eliminarMovimiento(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/contabilidad/${id}`);
      cargarMovimientos();
      cargarResumen();
    } catch {}
  }

  function cambiarMes(delta) {
    let m = mesSeleccionado + delta;
    let a = anioSeleccionado;
    if (m < 1) { m = 12; a--; }
    if (m > 12) { m = 1; a++; }
    setMesSeleccionado(m);
    setAnioSeleccionado(a);
  }

  async function descargarExcel(tipo = '') {
    try {
      const token = localStorage.getItem('token');
      const params = `mes=${mesSeleccionado}&anio=${anioSeleccionado}${tipo ? `&tipo=${tipo}` : ''}`;
      const res = await fetch(`${api.defaults.baseURL}/contabilidad/excel?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al descargar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const nombreTipo = tipo ? TIPOS.find((t) => t.value === tipo)?.label || tipo : 'Todos';
      a.download = `${nombreTipo}-${MESES[mesSeleccionado - 1]}-${anioSeleccionado}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  const [showExcelMenu, setShowExcelMenu] = useState(false);
  const excelMenuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (excelMenuRef.current && !excelMenuRef.current.contains(e.target)) setShowExcelMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Contabilidad</h1>
            <p className="text-ink/50 text-sm">Diezmos, ofrendas y gastos</p>
          </div>
          <button onClick={() => editandoId ? cancelarEdicion() : setShowForm(!showForm)} className="btn-gold text-sm">
            {showForm ? 'Cancelar' : editandoId ? 'Cancelar edición' : '+ Registrar'}
          </button>
        </div>

        {/* Selector de mes y año */}
        <div className="bg-white rounded-xl border border-line p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => cambiarMes(-1)} className="w-8 h-8 rounded-full bg-paper2 hover:bg-azul/10 flex items-center justify-center text-azul text-sm font-bold transition-colors">←</button>
              <select
                className="input text-sm py-1.5 w-36 text-center font-medium"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              >
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select
                className="input text-sm py-1.5 w-24 text-center font-medium"
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              >
                {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <button onClick={() => cambiarMes(1)} className="w-8 h-8 rounded-full bg-paper2 hover:bg-azul/10 flex items-center justify-center text-azul text-sm font-bold transition-colors">→</button>
            </div>
            <button
              onClick={() => { setMesSeleccionado(ahora.getMonth() + 1); setAnioSeleccionado(ahora.getFullYear()); }}
              className="text-xs text-azul hover:underline"
            >Mes actual</button>
            <div className="flex-1" />
            <div className="relative" ref={excelMenuRef}>
              <button onClick={() => setShowExcelMenu(!showExcelMenu)} className="btn-gold text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Descargar Excel ▾
              </button>
              {showExcelMenu && (
                <div className="absolute z-30 right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-lg w-52 overflow-hidden">
                  <button onClick={() => { descargarExcel(); setShowExcelMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-paper2 text-ink font-medium border-b border-line">
                    📊 Todos los tipos
                  </button>
                  {TIPOS.map((t) => (
                    <button key={t.value} onClick={() => { descargarExcel(t.value); setShowExcelMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-paper2 text-ink flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen del mes */}
        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-line p-4 text-center">
              <p className="text-xs text-ink/50 mb-1">Diezmos</p>
              <p className="text-lg font-bold text-azul">{formatMoney(resumen.diezmos.total)}</p>
              <p className="text-[10px] text-ink/40">{resumen.diezmos.cantidad} registros</p>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 text-center">
              <p className="text-xs text-ink/50 mb-1">Ofrendas</p>
              <p className="text-lg font-bold text-[#3E52C3]">{formatMoney(resumen.ofrendas.total)}</p>
              <p className="text-[10px] text-ink/40">{resumen.ofrendas.cantidad} registros</p>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 text-center">
              <p className="text-xs text-ink/50 mb-1">Donaciones</p>
              <p className="text-lg font-bold text-verde">{formatMoney(resumen.donaciones.total)}</p>
              <p className="text-[10px] text-ink/40">{resumen.donaciones.cantidad} registros</p>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 text-center">
              <p className="text-xs text-ink/50 mb-1">Gastos</p>
              <p className="text-lg font-bold text-rojo">{formatMoney(resumen.gastos.total)}</p>
              <p className="text-[10px] text-ink/40">{resumen.gastos.cantidad} registros</p>
            </div>
          </div>
        )}

        {/* Balance */}
        {resumen && (
          <div className="bg-white rounded-xl border border-line p-4 mb-6 text-center">
            <p className="text-xs text-ink/50 mb-1">Balance del mes</p>
            <p className={`text-2xl font-bold ${resumen.balance >= 0 ? 'text-verde' : 'text-rojo'}`}>
              {formatMoney(resumen.balance)}
            </p>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={registrarMovimiento}
            className="bg-white rounded-xl border border-line p-5 space-y-4 mb-6"
          >
            <h3 className="font-display font-semibold text-ink">{editandoId ? 'Editar registro' : form.tipo === 'gasto' ? 'Registrar gasto' : 'Nuevo registro'}</h3>

            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* ====== GASTO ====== */}
            {form.tipo === 'gasto' && (
              <>
                <div>
                  <label className="label">¿En qué se gastó?</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Papelería, Servicio de limpieza, Transporte…"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Monto (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input pl-7"
                      placeholder="0"
                      value={form.monto}
                      onChange={(e) => setForm({ ...form, monto: formatMontoInput(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Método de pago</label>
                    <select className="input" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                      {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Fecha</label>
                    <input type="date" className="input" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {/* ====== DIEZMO / OFRENDA / DONACIÓN ====== */}
            {form.tipo !== 'gasto' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Monto (COP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 text-sm">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input pl-7"
                        placeholder="0"
                        value={form.monto}
                        onChange={(e) => setForm({ ...form, monto: formatMontoInput(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Fecha</label>
                    <input type="date" className="input" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative" ref={personaRef}>
                    <label className="label">Persona (miembro)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Buscar por nombre o cédula…"
                      value={form.personaId ? personas.find((p) => p.id === form.personaId) ? `${personas.find((p) => p.id === form.personaId).nombres} ${personas.find((p) => p.id === form.personaId).apellidos}` : personaBusqueda : personaBusqueda}
                      onChange={(e) => {
                        setPersonaBusqueda(e.target.value);
                        setShowPersonaDropdown(true);
                        if (form.personaId) setForm({ ...form, personaId: '', nombreAnonimo: '' });
                      }}
                      onFocus={() => setShowPersonaDropdown(true)}
                      disabled={!!form.nombreAnonimo}
                    />
                    {showPersonaDropdown && !form.nombreAnonimo && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {personas.filter((p) => {
                          const q = personaBusqueda.toLowerCase();
                          if (!q) return true;
                          const nombre = `${p.nombres} ${p.apellidos}`.toLowerCase();
                          const doc = (p.numeroDocumento || '').toLowerCase();
                          return nombre.includes(q) || doc.includes(q);
                        }).length === 0 ? (
                          <div className="p-3 text-sm text-ink/40 text-center">Sin resultados</div>
                        ) : (
                          personas.filter((p) => {
                            const q = personaBusqueda.toLowerCase();
                            if (!q) return true;
                            const nombre = `${p.nombres} ${p.apellidos}`.toLowerCase();
                            const doc = (p.numeroDocumento || '').toLowerCase();
                            return nombre.includes(q) || doc.includes(q);
                          }).slice(0, 30).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-paper2 text-sm flex justify-between items-center"
                              onClick={() => {
                                setForm({ ...form, personaId: p.id, nombreAnonimo: '' });
                                setPersonaBusqueda('');
                                setShowPersonaDropdown(false);
                              }}
                            >
                              <span className="text-ink">{p.nombres} {p.apellidos}</span>
                              <span className="text-ink/40 text-xs">{p.numeroDocumento || '—'}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    {form.personaId && (
                      <button
                        type="button"
                        className="absolute right-3 top-8 text-ink/30 hover:text-rojo text-xs"
                        onClick={() => { setForm({ ...form, personaId: '' }); setPersonaBusqueda(''); }}
                      >✕</button>
                    )}
                  </div>
                  <div>
                    <label className="label">O nombre anónimo/externo</label>
                    <input type="text" className="input" placeholder="Anónimo / Nombre" value={form.nombreAnonimo} onChange={(e) => setForm({ ...form, nombreAnonimo: e.target.value, personaId: '' })} disabled={!!form.personaId} />
                  </div>
                </div>

                <div>
                  <label className="label">Método de pago</label>
                  <select className="input" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                    {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Descripción (opcional)</label>
                  <input type="text" className="input" placeholder="Ej: Ofrenda domingo 20 julio" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
              </>
            )}

            {error && <p className="text-rojo text-sm">{error}</p>}
            {exito && <p className="text-verde text-sm">{exito}</p>}

            <button type="submit" className="btn-gold w-full">{editandoId ? 'Guardar cambios' : form.tipo === 'gasto' ? 'Registrar gasto' : 'Registrar movimiento'}</button>
          </motion.form>
        )}

        {exito && !showForm && <p className="text-verde text-sm text-center">{exito}</p>}

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-line p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={filtro.tipo} onChange={(e) => { setFiltro({ ...filtro, tipo: e.target.value }); setPagina(1); }}>
                <option value="">Todos</option>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Desde</label>
              <input type="date" className="input" value={filtro.desde} onChange={(e) => { setFiltro({ ...filtro, desde: e.target.value }); setPagina(1); }} />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input type="date" className="input" value={filtro.hasta} onChange={(e) => { setFiltro({ ...filtro, hasta: e.target.value }); setPagina(1); }} />
            </div>
            <button onClick={() => { setFiltro({ tipo: '', desde: '', hasta: '' }); setPagina(1); }} className="text-sm text-azul hover:underline pb-1">Limpiar</button>
          </div>
        </div>

        {/* Lista de movimientos */}
        <div className="bg-white rounded-xl border border-line overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center text-ink/40">Cargando…</div>
          ) : movimientos.length === 0 ? (
            <div className="p-8 text-center text-ink/40">No hay registros</div>
          ) : (
            <div className="divide-y divide-line">
              {movimientos.map((m) => {
                const tipoInfo = TIPOS.find((t) => t.value === m.tipo) || TIPOS[0];
                const nombre = m.persona ? `${m.persona.nombres} ${m.persona.apellidos}` : m.nombreAnonimo || 'Anónimo';
                return (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-paper2/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full shrink-0" style={{ background: tipoInfo.color }} />
                      <div>
                        <p className="text-sm font-medium text-ink">{nombre}</p>
                        <p className="text-xs text-ink/40">
                          {tipoInfo.label} — {new Date(m.fecha).toLocaleDateString('es-CO')}
                          {m.metodoPago ? ` — ${m.metodoPago}` : ''}
                          {m.descripcion ? ` — ${m.descripcion}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${m.tipo === 'gasto' ? 'text-rojo' : 'text-verde'}`}>
                        {m.tipo === 'gasto' ? '-' : '+'}{formatMoney(m.monto)}
                      </span>
                      <button onClick={() => editarMovimiento(m)} className="text-ink/30 hover:text-azul text-xs" title="Editar">✎</button>
                      <button onClick={() => eliminarMovimiento(m.id)} className="text-ink/30 hover:text-rojo text-xs" title="Eliminar">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 p-3 border-t border-line">
              <button onClick={() => setPagina(Math.max(1, pagina - 1))} disabled={pagina === 1} className="text-sm text-azul disabled:text-ink/30">← Anterior</button>
              <span className="text-sm text-ink/40">{pagina} / {totalPaginas}</span>
              <button onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))} disabled={pagina === totalPaginas} className="text-sm text-azul disabled:text-ink/30">Siguiente →</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
