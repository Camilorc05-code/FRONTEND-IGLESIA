import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const VACIO = {
  titulo: '', fecha: '', horaInicio: '', horaFin: '', lugar: '',
  descripcion: '', imagenUrl: '', categoria: 'Otro',
};

export default function EventosAdmin() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [fotosTexto, setFotosTexto] = useState(''); // una URL por línea
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const { data } = await api.get('/eventos');
    setEventos(data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
  }

  useEffect(() => {
    cargar();
    api.get('/eventos/categorias').then((r) => setCategorias(r.data)).catch(() => {});
  }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setFotosTexto('');
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(e) {
    setForm({ ...VACIO, ...e, fecha: e.fecha.split('T')[0] });
    setFotosTexto((e.imagenes || []).map((img) => img.url).join('\n'));
    setEditando(e.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    const imagenes = fotosTexto.split('\n').map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, imagenes };
    try {
      if (editando) await api.put(`/eventos/${editando}`, payload);
      else await api.post('/eventos', payload);
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este evento?')) return;
    await api.delete(`/eventos/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Eventos</h1>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">+ Nuevo evento</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {eventos.map((e) => (
          <div key={e.id} className="bg-white rounded-xl border border-line p-5">
            <p className="font-mono text-xs text-rojo uppercase">
              {e.categoria} · {new Date(e.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h3 className="font-display text-lg text-ink">{e.titulo}</h3>
            {e.lugar && <p className="text-sm text-ink/60 mt-1">{e.lugar}</p>}
            {e.imagenes?.length > 0 && (
              <p className="text-xs text-ink/40 mt-1">{e.imagenes.length} foto(s) en la galería</p>
            )}
            <div className="flex gap-3 mt-3">
              <button onClick={() => abrirEditar(e)} className="text-azul text-sm font-medium">Editar</button>
              <button onClick={() => eliminar(e.id)} className="text-rojo/70 text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50" onClick={() => setModalAbierto(false)}>
          <div className="bg-paper rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-ink mb-5">{editando ? 'Editar evento' : 'Nuevo evento'}</h2>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Título *</label>
                <input required className="input" value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div>
                <label className="label">Categoría *</label>
                <select required className="input" value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha *</label>
                  <input required type="date" className="input" value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                </div>
                <div>
                  <label className="label">Hora inicio</label>
                  <input type="time" className="input" value={form.horaInicio || ''}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Lugar</label>
                <input className="input" value={form.lugar || ''}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
              </div>
              <div>
                <label className="label">Foto de portada (URL)</label>
                <input className="input" placeholder="https://…" value={form.imagenUrl || ''}
                  onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} />
              </div>
              <div>
                <label className="label">Galería de fotos (una URL por línea, opcional)</label>
                <textarea
                  className="input min-h-24 font-mono text-xs"
                  placeholder={'https://ejemplo.com/foto1.jpg\nhttps://ejemplo.com/foto2.jpg'}
                  value={fotosTexto}
                  onChange={(e) => setFotosTexto(e.target.value)}
                />
                <p className="text-xs text-ink/40 mt-1">
                  Sube tus fotos a un servicio gratis como Imgur o Cloudinary y pega aquí los enlaces directos.
                </p>
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input min-h-24" value={form.descripcion || ''}
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
