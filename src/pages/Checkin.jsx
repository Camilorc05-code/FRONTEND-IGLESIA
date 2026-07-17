import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export default function Checkin() {
  const [telefono, setTelefono] = useState('');
  const [paso, setPaso] = useState('telefono'); // telefono | confirmar | listo | error
  const [persona, setPersona] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function buscarPersona() {
    if (!telefono.trim()) return;
    setCargando(true);
    setMensaje('');
    try {
      const { data } = await api.post('/checkin/buscar', { telefono: telefono.trim() });
      setPersona(data);
      setPaso('confirmar');
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al buscar.');
      setPaso('error');
    } finally {
      setCargando(false);
    }
  }

  async function confirmarAsistencia() {
    setCargando(true);
    try {
      const { data } = await api.post('/checkin/registrar', { personaId: persona.id });
      setMensaje(data.mensaje);
      setPaso('listo');
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar.');
      setPaso('error');
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setTelefono('');
    setPersona(null);
    setMensaje('');
    setPaso('telefono');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-azul to-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-white font-display text-2xl">Check-in</h1>
          <p className="text-white/60 text-sm mt-1">Registra tu asistencia</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <AnimatePresence mode="wait">
            {/* Paso 1: Teléfono */}
            {paso === 'telefono' && (
              <motion.div
                key="telefono"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <label className="text-sm font-medium text-ink/70 block mb-2">Tu número de celular</label>
                <input
                  type="tel"
                  className="input text-center text-xl tracking-widest"
                  placeholder="3XX XXX XXXX"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarPersona()}
                  autoFocus
                  inputMode="numeric"
                />
                <button
                  onClick={buscarPersona}
                  disabled={!telefono.trim() || cargando}
                  className="btn-gold shadow-gold w-full mt-4 text-base py-3"
                >
                  {cargando ? 'Buscando...' : 'Buscar'}
                </button>
              </motion.div>
            )}

            {/* Paso 2: Confirmar */}
            {paso === 'confirmar' && persona && (
              <motion.div
                key="confirmar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-azul/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3E52C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p className="text-sm text-ink/50 mb-1">¿Es tu nombre?</p>
                <p className="font-display text-xl text-ink font-semibold">
                  {persona.nombres} {persona.apellidos}
                </p>
                {persona.ministerio && (
                  <p className="text-xs text-ink/40 mt-1">{persona.ministerio}</p>
                )}
                <button
                  onClick={confirmarAsistencia}
                  disabled={cargando}
                  className="btn-gold shadow-gold w-full mt-6 text-base py-3"
                >
                  {cargando ? 'Registrando...' : '✅ Sí, registrar asistencia'}
                </button>
                <button
                  onClick={reiniciar}
                  className="text-sm text-ink/40 mt-3 hover:text-ink/60"
                >
                  No soy yo — Cambiar número
                </button>
              </motion.div>
            )}

            {/* Paso 3: Listo */}
            {paso === 'listo' && (
              <motion.div
                key="listo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-verde/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <p className="font-display text-lg text-ink font-semibold mb-2">¡Listo!</p>
                <p className="text-sm text-ink/60">{mensaje}</p>
                <button
                  onClick={reiniciar}
                  className="btn-outline w-full mt-6"
                >
                  Registrar otra persona
                </button>
              </motion.div>
            )}

            {/* Error */}
            {paso === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-rojo/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E1011D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm text-ink/60 mb-4">{mensaje}</p>
                <button
                  onClick={reiniciar}
                  className="btn-gold shadow-gold w-full"
                >
                  Intentar de nuevo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Misión Panamericana — Centro de Fe y Esperanza
        </p>
      </div>
    </div>
  );
}
