import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const VACIO = { nombre: '', diaSemana: 'Domingo', horaInicio: '', horaFin: '', lugar: '', descripcion: '' };

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const { data } = await api.get('/servicios');
    setServicios(data);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(s) {
    setForm(s);
    setEditando(s.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) await api.put(`/servicios/${editando}`, form);
      else await api.post('/servicios', form);
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este horario?')) return;
    await api.delete(`/servicios/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Horarios de servicio</h1>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">+ Nuevo horario</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {servicios.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-line p-5">
            <p className="font-mono text-xs text-azul uppercase">{s.diaSemana}</p>
            <h3 className="font-display text-lg text-ink">{s.nombre}</h3>
            <p className="font-mono text-rojo">{s.horaInicio}{s.horaFin ? ` – ${s.horaFin}` : ''}</p>
            {s.lugar && <p className="text-sm text-ink/60 mt-1">{s.lugar}</p>}
            <div className="flex gap-3 mt-3">
              <button onClick={() => abrirEditar(s)} className="text-azul text-sm font-medium">Editar</button>
              <button onClick={() => eliminar(s.id)} className="text-rojo/70 text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50" onClick={() => setModalAbierto(false)}>
          <div className="bg-paper rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-ink mb-5">{editando ? 'Editar horario' : 'Nuevo horario'}</h2>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input required className="input" value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label">Día de la semana *</label>
                <select required className="input" value={form.diaSemana}
                  onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}>
                  {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Hora inicio *</label>
                  <input required type="time" className="input" value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
                </div>
                <div>
                  <label className="label">Hora fin</label>
                  <input type="time" className="input" value={form.horaFin || ''}
                    onChange={(e) => setForm({ ...form, horaFin: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Lugar</label>
                <input className="input" value={form.lugar || ''}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input min-h-20" value={form.descripcion || ''}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
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
