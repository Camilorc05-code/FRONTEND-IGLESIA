import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

export default function Checkin() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('buscar');
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [duplicado, setDuplicado] = useState(false);

  const buscar = async () => {
    if (busqueda.trim().length < 2) return;
    setCargando(true);
    setError('');
    setResultados([]);

    try {
      const res = await fetch(`${API}/api/checkin/buscar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: busqueda }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setCargando(false);
        return;
      }
      setResultados(data);
      if (data.length === 1) {
        setPaso('confirmar');
        setPersonaSeleccionada(data[0]);
      } else {
        setPaso('seleccionar');
      }
    } catch {
      setError('Error de conexión.');
    }
    setCargando(false);
  };

  const registrar = async (persona) => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/checkin/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: persona.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setCargando(false);
        return;
      }
      setDuplicado(data.duplicate || false);
      setMensaje(data.mensaje);
      setPersonaSeleccionada(data.persona || persona);
      setPaso('exito');
    } catch {
      setError('Error de conexión.');
    }
    setCargando(false);
  };

  const seleccionarPersona = (p) => {
    setPersonaSeleccionada(p);
    setPaso('confirmar');
  };

  const reiniciar = () => {
    setPaso('buscar');
    setBusqueda('');
    setResultados([]);
    setPersonaSeleccionada(null);
    setMensaje('');
    setError('');
    setDuplicado(false);
  };

  const ultimos4doc = (num) => {
    if (!num || num.length < 4) return num || '';
    return '***' + num.slice(-4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2A57] to-[#1B3A6B] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-white text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-blue-200 mt-1">Iglesia Misión Panamericana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {/* PASO: BUSCAR POR NOMBRE */}
            {paso === 'buscar' && (
              <motion.div key="buscar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escribe tu nombre completo
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscar()}
                  placeholder="Ej: María López"
                  autoFocus
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-[#D4A017] focus:outline-none transition-colors"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                  onClick={buscar}
                  disabled={cargando || busqueda.trim().length < 2}
                  className="w-full mt-4 bg-[#0A2A57] text-white font-semibold py-3 rounded-xl hover:bg-[#1B3A6B] disabled:opacity-40 transition-colors"
                >
                  {cargando ? 'Buscando...' : 'Buscar'}
                </button>

                <div className="mt-6 border-t pt-4 text-center">
                  <p className="text-gray-500 text-sm">¿No estás registrado?</p>
                  <button
                    onClick={() => navigate('/registrarse')}
                    className="mt-2 w-full border-2 border-[#D4A017] text-[#D4A017] font-semibold py-3 rounded-xl hover:bg-[#D4A017] hover:text-white transition-colors"
                  >
                    Registrarse aquí
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASO: SELECCIONAR ENTRE VARIOS */}
            {paso === 'seleccionar' && (
              <motion.div key="seleccionar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-700 font-semibold mb-3">
                  Encontramos {resultados.length} personas. Selecciona la correcta:
                </p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {resultados.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => seleccionarPersona(p)}
                      className="w-full text-left border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-[#D4A017] hover:bg-amber-50 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{p.apellidos} {p.nombres}</span>
                        {p.numeroDocumento && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            {ultimos4doc(p.numeroDocumento)}
                          </span>
                        )}
                      </div>
                      {(p.rolIglesia || p.ministerio) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {[p.rolIglesia, p.ministerio].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPaso('buscar')} className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm">
                  ← Volver a buscar
                </button>
              </motion.div>
            )}

            {/* PASO: CONFIRMAR UNA PERSONA */}
            {paso === 'confirmar' && personaSeleccionada && (
              <motion.div key="confirmar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-500 text-sm mb-1">¿Es tu nombre?</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {personaSeleccionada.apellidos} {personaSeleccionada.nombres}
                </p>
                {personaSeleccionada.numeroDocumento && (
                  <p className="text-xs text-gray-400 mb-4">
                    Doc: {personaSeleccionada.numeroDocumento}
                  </p>
                )}

                <button
                  onClick={() => registrar(personaSeleccionada)}
                  disabled={cargando}
                  className="w-full bg-[#0A2A57] text-white font-semibold py-3 rounded-xl hover:bg-[#1B3A6B] disabled:opacity-40 transition-colors"
                >
                  {cargando ? 'Registrando...' : 'Sí, registrar asistencia'}
                </button>
                <button
                  onClick={() => setPaso('buscar')}
                  className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2"
                >
                  ← No soy yo, volver
                </button>
              </motion.div>
            )}

            {/* PASO: ÉXITO */}
            {paso === 'exito' && (
              <motion.div key="exito" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="text-5xl mb-3">{duplicado ? '⚠️' : '✅'}</div>
                <p className="text-lg font-semibold text-gray-800 mb-4">{mensaje}</p>
                <button
                  onClick={reiniciar}
                  className="w-full bg-[#0A2A57] text-white font-semibold py-3 rounded-xl hover:bg-[#1B3A6B] transition-colors"
                >
                  Registrar otra persona
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2"
                >
                  Volver al inicio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-blue-300/60 text-xs text-center mt-4">
          Misión Panamericana · Paz de Ariporo
        </p>
      </motion.div>
    </div>
  );
}
