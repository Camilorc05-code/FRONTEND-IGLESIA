import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { formatTimeRange12h } from '../../utils/formatTime';
import { ImageUploader, ImageUploaderSingle } from '../../components/ImageUploader';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const VACIO = { nombre: '', diaSemana: 'Domingo', horaInicio: '', horaFin: '', lugar: '', descripcion: '', imagenUrl: '', imagenPosicion: 'center center' };

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [galeriaUrls, setGaleriaUrls] = useState([]);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const { data } = await api.get('/servicios');
    setServicios(data);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setGaleriaUrls([]);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(s) {
    setForm({ ...VACIO, ...s });
    setGaleriaUrls((s.imagenes || []).map((img) => img.url));
    setEditando(s.id);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    const payload = { ...form, imagenes: galeriaUrls };
    try {
      if (editando) await api.put(`/servicios/${editando}`, payload);
      else await api.post('/servicios', payload);
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Seguro quieres eliminar este horario?')) return;
    await api.delete(`/servicios/${id}`);
    cargar();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Horarios de servicio</h1>
          <p className="text-ink/50 text-sm mt-1">Gestiona los horarios y fotos de cada servicio</p>
        </div>
        <button onClick={abrirNuevo} className="btn-gold !py-2.5">+ Nuevo horario</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {servicios.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-line overflow-hidden hover:shadow-brand-sm transition-shadow"
            >
              {(s.imagenUrl || s.imagenes?.length > 0) && (
                <div className="h-32 overflow-hidden bg-ink/5 relative">
                  <img src={s.imagenUrl || s.imagenes?.[0]?.url} alt={s.nombre} className="w-full h-32 object-cover" style={{ objectPosition: s.imagenPosicion || 'center center' }} />
                  {s.imagenes?.length > 0 && (
                    <div className="absolute top-2 right-2 bg-ink/60 backdrop-blur text-paper text-xs font-mono px-2 py-0.5 rounded-full">
                      📷 {s.imagenes.length}
                    </div>
                  )}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block font-mono text-[10px] text-azul uppercase tracking-wide bg-azul/10 px-2 py-0.5 rounded-full mb-2">
                      {s.diaSemana}
                    </span>
                    <h3 className="font-display text-lg text-ink">{s.nombre}</h3>
                    <p className="font-mono text-sm text-rojo mt-1">
                      {formatTimeRange12h(s.horaInicio, s.horaFin)}
                    </p>
                    {s.lugar && <p className="text-sm text-ink/60 mt-1">📍 {s.lugar}</p>}
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-line/50">
                  <button onClick={() => abrirEditar(s)} className="text-azul text-sm font-medium hover:text-azul-dark transition-colors">Editar</button>
                  <button onClick={() => eliminar(s.id)} className="text-rojo/70 text-sm font-medium hover:text-rojo transition-colors">Eliminar</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {servicios.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink/40">Aún no hay horarios creados.</p>
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
                {editando ? 'Editar horario' : 'Nuevo horario'}
              </h2>
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="label">Nombre del servicio *</label>
                  <input required className="input" placeholder="Ej: Servicio Dominical"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="label">Día de la semana *</label>
                  <select required className="input" value={form.diaSemana}
                    onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}>
                    {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <input className="input" placeholder="Ej: Templo principal"
                    value={form.lugar || ''}
                    onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <textarea className="input min-h-16" placeholder="Descripción breve del servicio..."
                    value={form.descripcion || ''}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>

                {/* Subir foto de portada */}
                <ImageUploaderSingle
                  imagen={form.imagenUrl || ''}
                  posicion={form.imagenPosicion || 'center center'}
                  onPosicionChange={(pos) => setForm({ ...form, imagenPosicion: pos })}
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
