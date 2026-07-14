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
  ministerio: '',
  rolIglesia: '',
  notas: '',
};

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // id o null
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/personas', { params: { search, limit: 100 } });
      setPersonas(data.data);
      setTotal(data.total);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(cargar, 300); // debounce de búsqueda
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function abrirNuevo() {
    setForm(VACIO);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(persona) {
    setForm({ ...VACIO, ...persona });
    setEditando(persona.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/personas/${editando}`, form);
      } else {
        await api.post('/personas', form);
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
    if (!confirm('¿Eliminar esta persona de la base de datos?')) return;
    await api.delete(`/personas/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Personas</h1>
          <p className="text-ink/50 text-sm">{total} registradas</p>
        </div>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">
          + Agregar persona
        </button>
      </div>

      <input
        className="input max-w-sm mb-6"
        placeholder="Buscar por nombre, documento o teléfono…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-paper2 text-ink/60 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Teléfono</th>
              <th className="px-5 py-3 font-medium">Ministerio</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/40">Cargando…</td></tr>
            )}
            {!cargando && personas.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/40">No hay personas registradas.</td></tr>
            )}
            {personas.map((p) => (
              <tr key={p.id} className="hover:bg-paper2/50">
                <td className="px-5 py-3 font-medium text-ink">{p.nombres} {p.apellidos}</td>
                <td className="px-5 py-3 text-ink/70">{p.telefono || '—'}</td>
                <td className="px-5 py-3 text-ink/70">{p.ministerio || '—'}</td>
                <td className="px-5 py-3 text-ink/70">{p.rolIglesia || '—'}</td>
                <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => abrirEditar(p)} className="text-azul font-medium hover:text-rojo">
                    Editar
                  </button>
                  <button onClick={() => eliminar(p.id)} className="text-rojo/70 font-medium hover:text-rojo">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
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
              {editando ? 'Editar persona' : 'Agregar persona'}
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
                  <label className="label">Documento</label>
                  <input className="input" value={form.numeroDocumento || ''}
                    onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.telefono || ''}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Correo</label>
                <input type="email" className="input" value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
