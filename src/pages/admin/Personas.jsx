import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const VACIO = {
  nombres: '',
  apellidos: '',
  tipoDocumento: '',
  numeroDocumento: '',
  telefono: '',
  email: '',
  direccion: '',
  fechaNacimiento: '',
  ministerio: '',
  rolIglesia: '',
  notas: '',
  bautizado: false,
  fechaBautismo: '',
};

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function grupoEdad(edad) {
  if (edad === null) return 'Sin fecha';
  if (edad <= 12) return 'Niños';
  if (edad <= 17) return 'Jóvenes';
  return 'Adultos';
}

function colorGrupo(g) {
  if (g === 'Niños') return 'bg-rojo/10 text-rojo';
  if (g === 'Jóvenes') return 'bg-azul/10 text-azul';
  if (g === 'Adultos') return 'bg-gold/20 text-ink';
  return 'bg-ink/5 text-ink/40';
}

const GRUPOS = ['Todos', 'Niños', 'Jóvenes', 'Adultos', 'Sin fecha'];
const BAUTIZO = ['Todos', 'Bautizados', 'No bautizados'];

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [filtroBautismo, setFiltroBautismo] = useState('Todos');

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/personas', { params: { search, limit: 200 } });
      setPersonas(data.data);
      setTotal(data.total);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [search]);

  function abrirNuevo() {
    setForm(VACIO);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(persona) {
    setForm({
      ...VACIO,
      ...persona,
      fechaNacimiento: persona.fechaNacimiento
        ? new Date(persona.fechaNacimiento).toISOString().split('T')[0]
        : '',
      fechaBautismo: persona.fechaBautismo
        ? new Date(persona.fechaBautismo).toISOString().split('T')[0]
        : '',
      bautizado: persona.bautizado || false,
    });
    setEditando(persona.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        ...form,
        fechaNacimiento: form.fechaNacimiento || null,
        fechaBautismo: form.bautizado && form.fechaBautismo ? form.fechaBautismo : null,
        bautizado: !!form.bautizado,
      };
      if (editando) {
        await api.put(`/personas/${editando}`, payload);
      } else {
        await api.post('/personas', payload);
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este miembro de la base de datos?')) return;
    await api.delete(`/personas/${id}`);
    cargar();
  }

  const filtradas = personas.filter((p) => {
    if (filtroGrupo !== 'Todos' && grupoEdad(calcularEdad(p.fechaNacimiento)) !== filtroGrupo) return false;
    if (filtroBautismo === 'Bautizados' && !p.bautizado) return false;
    if (filtroBautismo === 'No bautizados' && p.bautizado) return false;
    return true;
  });

  const contadores = personas.reduce((acc, p) => {
    const g = grupoEdad(calcularEdad(p.fechaNacimiento));
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const contadoresBautismo = {
    Bautizados: personas.filter((p) => p.bautizado).length,
    'No bautizados': personas.filter((p) => !p.bautizado).length,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Miembros</h1>
          <p className="text-ink/50 text-sm">{total} registrados</p>
        </div>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">
          + Agregar miembro
        </button>
      </div>

      <input
        className="input max-w-sm mb-4"
        placeholder="Buscar por nombre, documento o teléfono…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-2">
        {GRUPOS.map((g) => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filtroGrupo === g
                ? 'bg-azul text-paper'
                : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
            }`}
          >
            {g}
            {g !== 'Todos' && contadores[g] ? ` (${contadores[g]})` : ''}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {BAUTIZO.map((b) => (
          <button
            key={b}
            onClick={() => setFiltroBautismo(b)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filtroBautismo === b
                ? 'bg-rojo text-paper'
                : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
            }`}
          >
            {b}
            {b !== 'Todos' && contadoresBautismo[b] !== undefined ? ` (${contadoresBautismo[b]})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-paper2 text-ink/60 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-5 py-3 font-medium">Edad</th>
              <th className="px-5 py-3 font-medium">Grupo</th>
              <th className="px-5 py-3 font-medium">Bautizado</th>
              <th className="px-5 py-3 font-medium">Teléfono</th>
              <th className="px-5 py-3 font-medium">Dirección</th>
              <th className="px-5 py-3 font-medium">Ministerio</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando && (
              <tr><td colSpan={9} className="px-5 py-6 text-center text-ink/40">Cargando…</td></tr>
            )}
            {!cargando && filtradas.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-6 text-center text-ink/40">No hay miembros registrados.</td></tr>
            )}
            {filtradas.map((p) => {
              const edad = calcularEdad(p.fechaNacimiento);
              const grupo = grupoEdad(edad);
              return (
                <tr key={p.id} className="hover:bg-paper2/50">
                  <td className="px-5 py-3 font-medium text-ink">{p.nombres} {p.apellidos}</td>
                  <td className="px-5 py-3 text-ink/70">{p.numeroDocumento || '—'}</td>
                  <td className="px-5 py-3 text-ink/70">{edad !== null ? `${edad} años` : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colorGrupo(grupo)}`}>
                      {grupo}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${
                        p.bautizado ? 'bg-azul/10 text-azul' : 'bg-ink/5 text-ink/40'
                      }`}
                      title={p.bautizado && p.fechaBautismo
                        ? `Bautizado el ${new Date(p.fechaBautismo).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : p.bautizado ? 'Bautizado (sin fecha registrada)' : 'No bautizado'
                      }
                    >
                      {p.bautizado ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink/70">{p.telefono || '—'}</td>
                  <td className="px-5 py-3 text-ink/70 text-xs">{p.direccion || '—'}</td>
                  <td className="px-5 py-3 text-ink/70">{p.ministerio || '—'}</td>
                  <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => abrirEditar(p)} className="text-azul font-medium hover:text-rojo">
                      Editar
                    </button>
                    <button onClick={() => eliminar(p.id)} className="text-rojo/70 font-medium hover:text-rojo">
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50" onClick={() => setModalAbierto(false)}>
          <div
            className="bg-paper rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-ink mb-5">
              {editando ? 'Editar miembro' : 'Agregar miembro'}
            </h2>
            <form onSubmit={guardar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombres *</label>
                  <input required className="input" value={form.nombres}
                    onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
                </div>
                <div>
                  <label className="label">Apellidos *</label>
                  <input required className="input" value={form.apellidos}
                    onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de nacimiento</label>
                  <input type="date" className="input" value={form.fechaNacimiento || ''}
                    onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                  {form.fechaNacimiento && (
                    <p className="text-xs text-azul mt-1">
                      {calcularEdad(form.fechaNacimiento)} años — {grupoEdad(calcularEdad(form.fechaNacimiento))}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.telefono || ''}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Documento</label>
                  <input className="input" value={form.numeroDocumento || ''}
                    onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
                </div>
                <div>
                  <label className="label">Correo</label>
                  <input type="email" className="input" value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Dirección</label>
                <input className="input" value={form.direccion || ''}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ministerio</label>
                  <input className="input" placeholder="Ej: Alabanza, Jóvenes…" value={form.ministerio || ''}
                    onChange={(e) => setForm({ ...form, ministerio: e.target.value })} />
                </div>
                <div>
                  <label className="label">Rol en la iglesia</label>
                  <input className="input" placeholder="Ej: Miembro, Líder…" value={form.rolIglesia || ''}
                    onChange={(e) => setForm({ ...form, rolIglesia: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Notas</label>
                <textarea className="input min-h-20" value={form.notas || ''}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })} />
              </div>

              <div>
                <label className="label">¿Bautizado?</label>
                <div className="flex gap-3 mt-1">
                  {['No', 'Si'].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setForm({ ...form, bautizado: op === 'Si', fechaBautismo: op === 'No' ? '' : form.fechaBautismo })}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        (op === 'Si' ? form.bautizado : !form.bautizado)
                          ? 'border-azul bg-azul/5 text-azul'
                          : 'border-line text-ink/50 hover:border-azul/30'
                      }`}
                    >
                      {op === 'Si' ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>
                {form.bautizado && (
                  <div className="mt-3">
                    <label className="label">Fecha de bautismo <span className="text-ink/30">(opcional)</span></label>
                    <input type="date" className="input" value={form.fechaBautismo || ''}
                      onChange={(e) => setForm({ ...form, fechaBautismo: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={guardando} className="btn-gold flex-1 disabled:opacity-60">
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
