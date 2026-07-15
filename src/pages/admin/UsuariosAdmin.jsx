import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';

const ROLES = ['ADMIN', 'PASTOR', 'LIDER'];
const ROL_LABELS = { ADMIN: 'Administrador', PASTOR: 'Pastor', LIDER: 'Líder' };
const ROL_COLORES = {
  ADMIN: 'bg-gold/20 text-gold-dark',
  PASTOR: 'bg-azul/15 text-azul',
  LIDER: 'bg-indigo/15 text-indigo',
};

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'LIDER', telefono: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      // Usamos el endpoint de personas que ya existe, pero filtramos por usuarios con rol
      // En realidad necesitamos un endpoint de usuarios. Usaremos el POST /api/auth/usuarios
      // para crear, pero para listar necesitamos algo. Vamos a crear una llamada directa.
      const { data } = await api.get('/auth/usuarios');
      setUsuarios(data);
    } catch {
      // Si el endpoint no existe aún, lo manejamos
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.post('/auth/usuarios', form);
      setModalAbierto(false);
      setForm({ nombre: '', email: '', password: '', rol: 'LIDER', telefono: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario.');
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(usuario) {
    try {
      await api.put(`/auth/usuarios/${usuario.id}/toggle`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar.');
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Usuarios del sistema</h1>
          <p className="text-ink/50 text-sm mt-1">Administra pastores, líderes y administradores</p>
        </div>
        <button onClick={() => { setForm({ nombre: '', email: '', password: '', rol: 'LIDER', telefono: '' }); setError(''); setModalAbierto(true); }} className="btn-gold !py-2.5">
          + Nuevo usuario
        </button>
      </div>

      {cargando && <p className="text-ink/40">Cargando…</p>}
      {!cargando && usuarios.length === 0 && (
        <p className="text-ink/40">No hay usuarios registrados.</p>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {usuarios.map((u) => (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-line p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-lg text-ink">{u.nombre}</h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${ROL_COLORES[u.rol]}`}>
                    {ROL_LABELS[u.rol] || u.rol}
                  </span>
                  {!u.activo && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rojo/15 text-rojo">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/60 mt-1">
                  📧 {u.email}
                  {u.telefono && <span className="ml-2">📞 {u.telefono}</span>}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleActivo(u)} className="btn-outline !py-1.5 !px-3 text-xs">
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal crear usuario */}
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
              <h2 className="font-display text-xl text-ink mb-5">Nuevo usuario</h2>
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="label">Nombre completo *</label>
                  <input required className="input" placeholder="Ej: Juan Pérez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="label">Correo electrónico *</label>
                  <input required type="email" className="input" placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Contraseña *</label>
                  <input required type="password" className="input" minLength={6} placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Rol *</label>
                    <select required className="input" value={form.rol}
                      onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Teléfono</label>
                    <input className="input" placeholder="Opcional"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                </div>
                {error && <p className="text-rojo text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={guardando} className="btn-gold flex-1 disabled:opacity-60">
                    {guardando ? 'Creando…' : 'Crear usuario'}
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
