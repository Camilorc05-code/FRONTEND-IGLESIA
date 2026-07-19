import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function Seguridad() {
  const { usuario } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [setupStep, setSetupStep] = useState('idle'); // idle, generating, showQR, verify
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  // Disable state
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    // Verificar el estado actual del 2FA del usuario
    setLoading(false);
  }, []);

  async function iniciarSetup() {
    setError('');
    setSuccess('');
    setSetupStep('generating');
    try {
      const { data } = await api.post('/2fa/setup');
      setQrUrl(data.otpauthUrl);
      setSecret(data.secret);
      setSetupStep('showQR');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar la configuración.');
      setSetupStep('idle');
    }
  }

  async function verificarCodigo(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/2fa/verify', { code: verifyCode });
      setTwoFactorEnabled(true);
      setSuccess('Autenticación de dos factores habilitada correctamente.');
      setSetupStep('idle');
      setVerifyCode('');
      setQrUrl('');
      setSecret('');
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  async function deshabilitar2FA(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/2fa/disable', { code: disableCode });
      setTwoFactorEnabled(false);
      setSuccess('Autenticación de dos factores deshabilitada.');
      setShowDisable(false);
      setDisableCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl text-ink mb-2">Seguridad</h1>
        <p className="text-ink/50 text-sm mb-8">
          Configura la autenticación de dos factores para mayor seguridad en tu cuenta.
        </p>

        {error && (
          <div className="bg-rojo/10 border border-rojo/20 text-rojo text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-4 mb-6">
            {success}
          </div>
        )}

        <div className="bg-paper rounded-2xl p-6 shadow-sm border border-line/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">Autenticación de dos factores (2FA)</h2>
              <p className="text-sm text-ink/50">
                {twoFactorEnabled
                  ? 'Tu cuenta tiene 2FA habilitado'
                  : 'Tu cuenta no tiene 2FA habilitado'}
              </p>
            </div>
            <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
              twoFactorEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-ink/5 text-ink/50'
            }`}>
              {twoFactorEnabled ? 'Activo' : 'Inactivo'}
            </div>
          </div>

          {/* Paso 1: Botón para iniciar setup */}
          {setupStep === 'idle' && !twoFactorEnabled && !showDisable && (
            <div>
              <p className="text-sm text-ink/60 mb-4">
                La autenticación de dos factores añade una capa extra de seguridad. 
                Necesitarás una aplicación como Google Authenticator o Authy.
              </p>
              <button onClick={iniciarSetup} className="btn-gold">
                Habilitar 2FA
              </button>
            </div>
          )}

          {setupStep === 'generating' && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-ink/50">Generando configuración...</p>
            </div>
          )}

          {/* Paso 2: Mostrar QR */}
          {setupStep === 'showQR' && (
            <div>
              <h3 className="font-display text-base text-ink mb-4">Paso 1: Escanea el código QR</h3>
              <div className="bg-paper2 rounded-xl p-6 text-center mb-4">
                <p className="text-sm text-ink/60 mb-3">
                  Abre Google Authenticator o Authy y escanea este código:
                </p>
                <div className="inline-block bg-white p-4 rounded-xl border border-line/50 mb-3">
                  {/* Usar una librería de QR o mostrar la URL */}
                  <div className="w-48 h-48 bg-ink/5 rounded-lg flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                      alt="Código QR para 2FA"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-xs text-ink/40 mt-2">Si no puedes escanear, usa esta URL:</p>
                <p className="text-xs text-ink/60 font-mono break-all mt-1 px-4">{qrUrl}</p>
              </div>
              
              <h3 className="font-display text-base text-ink mb-3">Paso 2: Ingresa el código de verificación</h3>
              <p className="text-sm text-ink/60 mb-3">
                Después de escanear, ingresa el código de 6 dígitos que aparece en la app:
              </p>
              <form onSubmit={verificarCodigo} className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="input text-center text-lg tracking-[0.5em] font-mono"
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando || verifyCode.length !== 6}
                  className="btn-gold disabled:opacity-60 shrink-0"
                >
                  {cargando ? 'Verificando...' : 'Verificar y habilitar'}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setSetupStep('idle');
                  setVerifyCode('');
                  setQrUrl('');
                  setSecret('');
                }}
                className="text-sm text-ink/40 hover:text-ink/60 mt-3"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Opción de deshabilitar */}
          {twoFactorEnabled && !showDisable && (
            <div className="mt-6 pt-6 border-t border-line/50">
              <button
                onClick={() => setShowDisable(true)}
                className="text-sm text-rojo hover:text-rojo/80"
              >
                Deshabilitar 2FA
              </button>
            </div>
          )}

          {showDisable && (
            <div className="mt-6 pt-6 border-t border-line/50">
              <h3 className="font-display text-base text-ink mb-2">Deshabilitar 2FA</h3>
              <p className="text-sm text-ink/60 mb-3">
                Para deshabilitar, ingresa el código actual de tu aplicación de autenticación:
              </p>
              <form onSubmit={deshabilitar2FA} className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="input text-center text-lg tracking-[0.5em] font-mono"
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando || disableCode.length !== 6}
                  className="bg-rojo text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rojo/90 disabled:opacity-60 shrink-0"
                >
                  {cargando ? 'Deshabilitando...' : 'Deshabilitar'}
                </button>
              </form>
              <button
                onClick={() => {
                  setShowDisable(false);
                  setDisableCode('');
                }}
                className="text-sm text-ink/40 hover:text-ink/60 mt-3"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
