import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import logoCfeTransparente from '../../assets/logo-cfe-transparente.png';

export default function Login() {
  const { login, complete2FALogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estado para 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [usuario2FA, setUsuario2FA] = useState(null);
  const [code2FA, setCode2FA] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error2FA, setError2FA] = useState('');
  const [cargando2FA, setCargando2FA] = useState(false);

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
      const resultado = await login(email, password);

      // Guardar o limpiar email recordado
      if (recordar) {
        localStorage.setItem('login_email_recordado', email);
      } else {
        localStorage.removeItem('login_email_recordado');
      }

      // Verificar si el dispositivo ya está verificado para 2FA
      if (resultado.requires2FA) {
        const deviceKey = `2fa_verified_${resultado.usuario.id}`;
        if (localStorage.getItem(deviceKey)) {
          // Dispositivo ya verificado, completar login directamente
          await completeLoginWithCode(resultado.tempToken, resultado.usuario, 'skip');
        } else {
          // Mostrar pantalla de código 2FA
          setRequires2FA(true);
          setTempToken(resultado.tempToken);
          setUsuario2FA(resultado.usuario);
        }
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  async function completeLoginWithCode(token, usuarioData, code) {
    try {
      const { data } = await api.post('/2fa/validate', { token, code });

      // Marcar dispositivo como verificado si el usuario lo eligió
      if (rememberDevice && code !== 'skip') {
        const deviceKey = `2fa_verified_${usuarioData.id}`;
        localStorage.setItem(deviceKey, 'true');
      }

      await complete2FALogin(data.fullToken, data.usuario);
      navigate('/admin');
    } catch (err) {
      throw err;
    }
  }

  async function enviar2FA(e) {
    e.preventDefault();
    setError2FA('');
    setCargando2FA(true);
    try {
      await completeLoginWithCode(tempToken, usuario2FA, code2FA);
    } catch (err) {
      setError2FA(err.response?.data?.error || 'Código incorrecto. Intenta de nuevo.');
    } finally {
      setCargando2FA(false);
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

        <AnimatePresence mode="wait">
          {!requires2FA ? (
            <motion.form
              key="login-form"
              onSubmit={enviar}
              className="bg-paper rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
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
            </motion.form>
          ) : (
            <motion.form
              key="twofa-form"
              onSubmit={enviar2FA}
              className="bg-paper rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 mb-3">
                  <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg text-ink">Verificación de seguridad</h2>
                <p className="text-sm text-ink/50 mt-1">
                  Ingresa el código de 6 dígitos de tu aplicación de autenticación
                </p>
              </div>
              <div>
                <label className="label">Código de verificación</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="input text-center text-lg tracking-[0.5em] font-mono"
                  placeholder="000000"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-line text-azul focus:ring-gold cursor-pointer"
                />
                <label htmlFor="rememberDevice" className="text-sm text-ink/60 cursor-pointer select-none">
                  Recordar este dispositivo
                </label>
              </div>
              {error2FA && <p className="text-rojo text-sm">{error2FA}</p>}
              <button type="submit" disabled={cargando2FA || code2FA.length !== 6} className="btn-gold w-full disabled:opacity-60">
                {cargando2FA ? 'Verificando…' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setCode2FA('');
                  setError2FA('');
                }}
                className="w-full text-center text-sm text-ink/50 hover:text-ink/80 py-1"
              >
                ← Volver al inicio de sesión
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <Link to="/" className="block text-center text-paper/40 text-sm mt-6 hover:text-paper/70">
          ← Volver al sitio público
        </Link>
      </motion.div>
    </div>
  );
}
