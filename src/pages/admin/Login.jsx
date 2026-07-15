import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import logoCfeTransparente from '../../assets/logo-cfe-transparente.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar email guardado si existía
  useEffect(() => {
    const guardado = localStorage.getItem('login_email_recordado');
    if (guardado) {
      setEmail(guardado);
      setRecordar(true);
    }
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
      // Guardar o limpiar email recordado
      if (recordar) {
        localStorage.setItem('login_email_recordado', email);
      } else {
        localStorage.removeItem('login_email_recordado');
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-center mb-6">
          <img src={logoCfeTransparente} alt="Centro de Fe y Esperanza" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="font-display text-2xl text-paper text-center mb-1">Panel interno</h1>
        <p className="text-paper/50 text-sm text-center mb-8">
          Misión Panamericana — Centro de Fe y Esperanza
        </p>

        <form onSubmit={enviar} className="bg-paper rounded-2xl p-6 space-y-4">
          <div>
            <label className="label">Correo</label>
            <input
              required
              type="email"
              className="input"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              required
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recordar"
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
              className="w-4 h-4 rounded border-line text-azul focus:ring-gold cursor-pointer"
            />
            <label htmlFor="recordar" className="text-sm text-ink/60 cursor-pointer select-none">
              Recordar mi correo
            </label>
          </div>
          {error && <p className="text-rojo text-sm">{error}</p>}
          <button type="submit" disabled={cargando} className="btn-gold w-full disabled:opacity-60">
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <Link to="/" className="block text-center text-paper/40 text-sm mt-6 hover:text-paper/70">
          ← Volver al sitio público
        </Link>
      </motion.div>
    </div>
  );
}
