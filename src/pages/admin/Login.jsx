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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [usuario2FA, setUsuario2FA] = useState(null);

  // Estado para setup de 2FA
  const [step, setStep] = useState('login'); // login | setup-scan | setup-verify | code
  const [qrUrl, setQrUrl] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [error2FA, setError2FA] = useState('');
  const [cargando2FA, setCargando2FA] = useState(false);
  const [cargandoSetup, setCargandoSetup] = useState(false);

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

      if (recordar) {
        localStorage.setItem('login_email_recordado', email);
      } else {
        localStorage.removeItem('login_email_recordado');
      }

      if (resultado.requires2FA) {
        const deviceKey = `2fa_verified_${resultado.usuario.id}`;
        if (localStorage.getItem(deviceKey)) {
          // Dispositivo ya verificado — saltar 2FA
          await completeLoginWithCode(resultado.tempToken, resultado.usuario, 'skip');
        } else if (!resultado.twoFactorEnabled) {
          // Primer login — forzar setup de 2FA
          setRequires2FA(true);
          setTwoFactorEnabled(false);
          setTempToken(resultado.tempToken);
          setUsuario2FA(resultado.usuario);
          setStep('setup-scan');
          iniciarSetup(resultado.tempToken);
        } else {
          // 2FA ya habilitado — pedir código
          setRequires2FA(true);
          setTwoFactorEnabled(true);
          setTempToken(resultado.tempToken);
          setUsuario2FA(resultado.usuario);
          setStep('code');
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

  async function iniciarSetup(token) {
    setCargandoSetup(true);
    try {
      const { data } = await api.post('/2fa/setup', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrUrl(data.otpauthUrl);
      setSetupSecret(data.secret);
    } catch (err) {
      setError2FA('Error al configurar 2FA. Intenta de nuevo.');
    } finally {
      setCargandoSetup(false);
    }
  }

  async function enviarSetup(e) {
    e.preventDefault();
    setError2FA('');
    setCargando2FA(true);
    try {
      const { data } = await api.post('/2fa/verify', { code: setupCode }, {
        headers: { Authorization: `Bearer ${tempToken}` },
      });

      // Marcar dispositivo como verificado
      const deviceKey = `2fa_verified_${usuario2FA.id}`;
      localStorage.setItem(deviceKey, 'true');

      await complete2FALogin(data.fullToken, data.usuario);
      navigate('/admin');
    } catch (err) {
      setError2FA(err.response?.data?.error || 'Código incorrecto. Intenta de nuevo.');
    } finally {
      setCargando2FA(false);
    }
  }

  async function completeLoginWithCode(token, usuarioData, code) {
    try {
      const { data } = await api.post('/2fa/validate', { token, code });
      const deviceKey = `2fa_verified_${usuarioData.id}`;
      localStorage.setItem(deviceKey, 'true');
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
          {/* Formulario de login */}
          {step === 'login' && (
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
          )}

          {/* Setup: escanear QR */}
          {step === 'setup-scan' && (
            <motion.div
              key="setup-scan"
              className="bg-paper rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-azul/10 mb-3">
                  <svg className="w-7 h-7 text-azul" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg text-ink">Configurar seguridad</h2>
                <p className="text-sm text-ink/50 mt-1">
                  Escanea este código QR con Google Authenticator o Authy
                </p>
              </div>

              {cargandoSetup ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl border border-line">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                        alt="QR Code para 2FA"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-amber-700 font-medium">Código de respaldo:</p>
                    <p className="text-sm font-mono font-bold text-amber-800 mt-1 tracking-wider">{setupSecret}</p>
                    <p className="text-xs text-amber-600 mt-1">Guárdalo en un lugar seguro</p>
                  </div>
                  <button
                    onClick={() => setStep('setup-verify')}
                    className="btn-gold w-full"
                  >
                    Siguiente →
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Setup: verificar código */}
          {step === 'setup-verify' && (
            <motion.form
              key="setup-verify"
              onSubmit={enviarSetup}
              className="bg-paper rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-verde/10 mb-3">
                  <svg className="w-7 h-7 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg text-ink">Verificar configuración</h2>
                <p className="text-sm text-ink/50 mt-1">
                  Abre Google Authenticator y escribe el código de 6 dígitos
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
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              {error2FA && <p className="text-rojo text-sm">{error2FA}</p>}
              <button type="submit" disabled={cargando2FA || setupCode.length !== 6} className="btn-gold w-full disabled:opacity-60">
                {cargando2FA ? 'Verificando…' : 'Activar y entrar'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('setup-scan'); setSetupCode(''); setError2FA(''); }}
                className="w-full text-center text-sm text-ink/50 hover:text-ink/80 py-1"
              >
                ← Volver al QR
              </button>
            </motion.form>
          )}

          {/* Código 2FA (ya habilitado) */}
          {step === 'code' && (
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
              {error2FA && <p className="text-rojo text-sm">{error2FA}</p>}
              <button type="submit" disabled={cargando2FA || code2FA.length !== 6} className="btn-gold w-full disabled:opacity-60">
                {cargando2FA ? 'Verificando…' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('login'); setRequires2FA(false); setCode2FA(''); setError2FA(''); }}
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
