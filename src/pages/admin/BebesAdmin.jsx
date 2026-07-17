import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';

export default function BebesAdmin() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombreBebe: '',
    fechaNacimiento: '',
    nombreMadre: '',
    nombrePadre: '',
    fechaPresentacion: '',
    notas: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get('/presentaciones');
      setLista(data);
    } catch {
      setLista([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() {
    setEditando(null);
    setForm({ nombreBebe: '', fechaNacimiento: '', nombreMadre: '', nombrePadre: '', fechaPresentacion: '', notas: '' });
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(b) {
    setEditando(b);
    setForm({
      nombreBebe: b.nombreBebe,
      fechaNacimiento: b.fechaNacimiento?.slice(0, 10) || '',
      nombreMadre: b.nombreMadre,
      nombrePadre: b.nombrePadre,
      fechaPresentacion: b.fechaPresentacion?.slice(0, 10) || '',
      notas: b.notas || '',
    });
    setError('');
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/presentaciones/${editando.id}`, form);
      } else {
        await api.post('/presentaciones', form);
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(b) {
    if (!window.confirm(`¿Seguro quieres eliminar la presentación de "${b.nombreBebe}"?`)) return;
    try {
      await api.delete(`/presentaciones/${b.id}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar.');
    }
  }

  function descargarExcel() {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'https://backend-iglesia-3op0.onrender.com';
    fetch(`${API_URL}/api/excel/presentaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentaciones-bebes.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const filtradas = lista.filter((b) => {
    if (!search) return true;
    return b.nombreBebe.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Presentaciones de bebés</h1>
          <p className="text-ink/50 text-sm mt-1">Registrar y administrar presentaciones</p>
        </div>
        <div className="flex gap-2">
          <button onClick={descargarExcel} className="btn-outline !py-2.5 !px-4 text-sm">
            Descargar Excel
          </button>
          <button onClick={abrirCrear} className="btn-gold !py-2.5">
            + Nueva presentación
          </button>
        </div>
      </div>

      <input
        className="input max-w-sm mb-6"
        placeholder="Buscar por nombre del bebé…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {cargando && <p className="text-ink/40">Cargando…</p>}
      {!cargando && filtradas.length === 0 && (
        <p className="text-ink/40">No hay presentaciones registradas.</p>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filtradas.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-line p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-lg text-ink">{b.nombreBebe}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark">
                    {new Date(b.fechaPresentacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-ink/60 mt-1">
                  👶 Nacimiento: {new Date(b.fechaNacimiento).toLocaleDateString('es-CO')}
                  <span className="mx-2">·</span>
                  👩 {b.nombreMadre}
                  <span className="mx-2">·</span>
                  👨 {b.nombrePadre}
                </p>
                {b.notas && <p className="text-xs text-ink/40 mt-1">📝 {b.notas}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => abrirEditar(b)} className="btn-outline !py-1.5 !px-3 text-xs">
                  Editar
                </button>
                <button onClick={() => eliminar(b)} className="btn-outline !py-1.5 !px-3 text-xs !border-rojo/30 !text-rojo hover:!bg-rojo/10">
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal crear/editar */}
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
              className="bg-paper rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-xl text-ink mb-5">
                {editando ? 'Editar presentación' : 'Nueva presentación'}
              </h2>
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="label">Nombre del bebé *</label>
                  <input required className="input" placeholder="Ej: Santiago López"
                    value={form.nombreBebe}
                    onChange={(e) => setForm({ ...form, nombreBebe: e.target.value })} />
                </div>
                <div>
                  <label className="label">Fecha de nacimiento *</label>
                  <input required type="date" className="input"
                    value={form.fechaNacimiento}
                    onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                </div>
                <div>
                  <label className="label">Nombre de la madre *</label>
                  <input required className="input" placeholder="Ej: María López"
                    value={form.nombreMadre}
                    onChange={(e) => setForm({ ...form, nombreMadre: e.target.value })} />
                </div>
                <div>
                  <label className="label">Nombre del padre *</label>
                  <input required className="input" placeholder="Ej: Carlos López"
                    value={form.nombrePadre}
                    onChange={(e) => setForm({ ...form, nombrePadre: e.target.value })} />
                </div>
                <div>
                  <label className="label">Fecha de presentación *</label>
                  <input required type="date" className="input"
                    value={form.fechaPresentacion}
                    onChange={(e) => setForm({ ...form, fechaPresentacion: e.target.value })} />
                </div>
                <div>
                  <label className="label">Notas</label>
                  <textarea className="input" rows={2} placeholder="Opcional"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })} />
                </div>
                {error && <p className="text-rojo text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando} className="btn-gold flex-1 disabled:opacity-60">
                    {guardando ? 'Guardando…' : editando ? 'Actualizar' : 'Crear'}
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
