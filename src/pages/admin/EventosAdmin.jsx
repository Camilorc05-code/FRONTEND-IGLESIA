import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { formatTime12h } from '../../utils/formatTime';
import { ImageUploader, ImageUploaderSingle } from '../../components/ImageUploader';

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
  const [galeriaUrls, setGaleriaUrls] = useState([]);
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
    setGaleriaUrls([]);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(e) {
    setForm({ ...VACIO, ...e, fecha: e.fecha.split('T')[0] });
    setGaleriaUrls((e.imagenes || []).map((img) => img.url));
    setEditando(e.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    const payload = { ...form, imagenes: galeriaUrls };
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
    if (!confirm('¿Seguro quieres eliminar este evento?')) return;
    await api.delete(`/eventos/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Eventos</h1>
          <p className="text-ink/50 text-sm mt-1">Gestiona eventos, fotos y galerías</p>
        </div>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">+ Nuevo evento</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {eventos.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-line overflow-hidden hover:shadow-brand-sm transition-shadow"
            >
              <div className="h-36 overflow-hidden bg-ink/5 relative">
                {e.imagenUrl ? (
                  <img src={e.imagenUrl} alt={e.titulo} className="w-full h-36 object-cover" />
                ) : e.imagenes?.[0] ? (
                  <img src={e.imagenes[0].url} alt={e.titulo} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 flex items-center justify-center text-ink/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {e.imagenes?.length > 0 && (
                  <div className="absolute top-2 right-2 bg-ink/60 backdrop-blur text-paper text-xs font-mono px-2 py-0.5 rounded-full">
                    📷 {e.imagenes.length}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block font-mono text-[10px] text-rojo uppercase tracking-wide bg-rojo/10 px-2 py-0.5 rounded-full">
                        {e.categoria}
                      </span>
                      <span className="font-mono text-[10px] text-ink/40">
                        {new Date(e.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-ink">{e.titulo}</h3>
                    {e.horaInicio && (
                      <p className="text-xs text-ink/50 mt-1">
                        🕐 {formatTime12h(e.horaInicio)}{e.horaFin ? ` – ${formatTime12h(e.horaFin)}` : ''}
                      </p>
                    )}
                    {e.lugar && <p className="text-sm text-ink/60 mt-1">📍 {e.lugar}</p>}
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-line/50">
                  <button onClick={() => abrirEditar(e)} className="text-azul text-sm font-medium hover:text-azul-dark transition-colors">Editar</button>
                  <button onClick={() => eliminar(e.id)} className="text-rojo/70 text-sm font-medium hover:text-rojo transition-colors">Eliminar</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {eventos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink/40">Aún no hay eventos creados.</p>
        </div>
      )}

      {/* Modal de crear/editar */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setModalAbierto(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-paper rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-xl text-ink mb-5">
                {editando ? 'Editar evento' : 'Nuevo evento'}
              </h2>
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="label">Título del evento *</label>
                  <input required className="input" placeholder="Ej: Cumbre Ministerial 2026"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div>
                  <label className="label">Categoría *</label>
                  <select required className="input" value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                    {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <input className="input" placeholder="Ej: Templo principal"
                    value={form.lugar || ''}
                    onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
                </div>

                {/* Subir foto de portada */}
                <ImageUploaderSingle
                  imagen={form.imagenUrl || ''}
                  onChange={(url) => setForm({ ...form, imagenUrl: url })}
                  label="Foto de portada"
                />

                {/* Subir galería de fotos */}
                <ImageUploader
                  imagenes={galeriaUrls}
                  onChange={setGaleriaUrls}
                  label="Galería de fotos"
                  maximo={20}
                />

                <div>
                  <label className="label">Descripción</label>
                  <textarea className="input min-h-24" placeholder="Describe el evento..."
                    value={form.descripcion || ''}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
