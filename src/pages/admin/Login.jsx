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

  // Estado para SMS OTP
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [usuarioSMS, setUsuarioSMS] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [errorOTP, setErrorOTP] = useState('');
  const [cargandoOTP, setCargandoOTP] = useState(false);
  const [smsEnviado, setSmsEnviado] = useState(false);
  const [enviandoSMS, setEnviandoSMS] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const guardado = localStorage.getItem('login_email_recordado');
    if (guardado) {
      setEmail(guardado);
      setRecordar(true);
    }
  }, []);

  // Countdown para reenviar SMS
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const resultado = await login(email, password);

      if (recordar) {
        localStorage.setItem('login_email_recordado', email);
      } else {
        localStorage.removeItem('login_email_recordado');
      }

      if (resultado.requires2FA) {
        const deviceKey = `sms_verified_${resultado.usuario.id}`;
        if (localStorage.getItem(deviceKey)) {
          // Dispositivo ya verificado — pedir código directamente
          setRequires2FA(true);
          setTempToken(resultado.tempToken);
          setUsuarioSMS(resultado.usuario);
          // Enviar SMS automáticamente
          enviarSMS(resultado.tempToken);
        } else {
          // Primer login — mostrar pantalla SMS
          setRequires2FA(true);
          setTempToken(resultado.tempToken);
          setUsuarioSMS(resultado.usuario);
          enviarSMS(resultado.tempToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  async function enviarSMS(token) {
    setEnviandoSMS(true);
    setErrorOTP('');
    try {
      await api.post('/otp/enviar', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSmsEnviado(true);
      setCountdown(60); // 60 segundos para reenviar
    } catch (err) {
      setErrorOTP(err.response?.data?.error || 'Error al enviar el SMS.');
    } finally {
      setEnviandoSMS(false);
    }
  }

  async function reenviarSMS() {
    if (countdown > 0) return;
    await enviarSMS(tempToken);
    setOtpCode('');
  }

  async function validarCodigo(e) {
    e.preventDefault();
    setErrorOTP('');
    setCargandoOTP(true);
    try {
      const { data } = await api.post('/otp/validar', { token: tempToken, codigo: otpCode });

      // Marcar dispositivo como verificado
      const deviceKey = `sms_verified_${usuarioSMS.id}`;
      localStorage.setItem(deviceKey, 'true');

      await complete2FALogin(data.fullToken, data.usuario);
      navigate('/admin');
    } catch (err) {
      setErrorOTP(err.response?.data?.error || 'Código incorrecto.');
      setOtpCode('');
    } finally {
      setCargandoOTP(false);
    }
  }

  const phoneLast4 = usuarioSMS?.telefono ? usuarioSMS.telefono.slice(-4) : '';

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
              key="otp-form"
              onSubmit={validarCodigo}
              className="bg-paper rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-azul/10 mb-3">
                  <svg className="w-7 h-7 text-azul" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg text-ink">Verificación por SMS</h2>
                <p className="text-sm text-ink/50 mt-1">
                  Enviamos un código de 6 dígitos al número terminado en <strong>****{phoneLast4}</strong>
                </p>
              </div>

              {smsEnviado && (
                <div className="bg-verde/5 border border-verde/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-verde font-medium">✓ Código enviado correctamente</p>
                </div>
              )}

              {enviandoSMS && (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-azul border-t-transparent rounded-full animate-spin" />
                </div>
              )}

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
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  disabled={enviandoSMS}
                />
              </div>

              {errorOTP && <p className="text-rojo text-sm">{errorOTP}</p>}

              <button type="submit" disabled={cargandoOTP || otpCode.length !== 6 || enviandoSMS} className="btn-gold w-full disabled:opacity-60">
                {cargandoOTP ? 'Verificando…' : 'Verificar'}
              </button>

              <button
                type="button"
                onClick={reenviarSMS}
                disabled={countdown > 0 || enviandoSMS}
                className="w-full text-center text-sm text-azul hover:text-azul/80 py-1 disabled:text-ink/30 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Reenviar código en ${countdown}s` : 'Reenviar código'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setSmsEnviado(false);
                  setOtpCode('');
                  setErrorOTP('');
                  setCountdown(0);
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
