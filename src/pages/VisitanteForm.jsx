import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { Reveal } from '../components/Reveal';

const MAX_ADICIONAL = 200;

const variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function Paso({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function VisitanteForm() {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    barrio: '',
    adicional: '',
    asisteOtraIglesia: '',
    desearLlamada: '',
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: '' }));
  }

  function validarPaso() {
    const err = {};
    if (paso === 0) {
      if (!form.nombres.trim()) err.nombres = 'Ingresa tu nombre';
      if (!form.apellidos.trim()) err.apellidos = 'Ingresa tu apellido';
    }
    if (paso === 1) {
      if (!form.telefono.trim()) err.telefono = 'Ingresa tu número de celular';
      else if (!/^\d{7,15}$/.test(form.telefono.replace(/\s/g, ''))) err.telefono = 'Número no válido';
    }
    if (paso === 2) {
      if (!form.asisteOtraIglesia) err.asisteOtraIglesia = 'Selecciona una opción';
      if (!form.desearLlamada) err.desearLlamada = 'Selecciona una opción';
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  }

  function siguientePaso() {
    if (validarPaso()) setPaso((p) => p + 1);
  }

  function pasoAnterior() {
    setPaso((p) => p - 1);
  }

  async function enviar(e) {
    e.preventDefault();
    if (!validarPaso()) return;
    setEnviando(true);
    try {
      await api.post('/visitas', {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim() || undefined,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim() || undefined,
        barrio: form.barrio.trim() || undefined,
        adicional: form.adicional.trim() || undefined,
        asisteOtraIglesia: form.asisteOtraIglesia,
        desearLlamada: form.desearLlamada,
      });
      setResultado('ok');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#024293', '#FFCD02', '#E1011D', '#3E52C3'],
      });
    } catch (err) {
      setResultado('error');
    } finally {
      setEnviando(false);
    }
  }

  const totalPasos = 3;
  const progreso = ((paso + 1) / totalPasos) * 100;

  if (resultado === 'ok') {
    return (
      <div>
        <section className="bg-amanecer">
          <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center">
            <Reveal>
              <p className="eyebrow mb-3">¡Bienvenido!</p>
              <h1 className="font-display text-4xl md:text-5xl text-ink">Gracias por registrarte</h1>
            </Reveal>
          </div>
          <Horizonte className="text-paper" />
        </section>
        <section className="max-w-xl mx-auto px-5 md:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card border-azul"
          >
            <div className="w-16 h-16 rounded-full bg-azul/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#024293" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="font-display text-xl text-ink mb-2">¡Hola, {form.nombres}!</p>
            <p className="text-ink/60 leading-relaxed">
              Tu registro fue enviado exitosamente. Nos pondremos en contacto contigo pronto.
              {form.desearLlamada === 'Si' && ' Te llamaremos pronto.'}
            </p>
            <p className="text-ink/50 text-sm mt-6">
              Mientras tanto, puedes revisar nuestros horarios o agendar una cita pastoral.
            </p>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-amanecer">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center">
          <Reveal>
            <p className="eyebrow mb-3">Bienvenido a la familia</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Regístrate</h1>
            <p className="text-ink/70 max-w-lg mx-auto mt-4">
              Cuéntanos un poco sobre ti para poder acompañarte mejor en tu camino de fe.
            </p>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      <section className="max-w-xl mx-auto px-5 md:px-8 py-14">
        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-ink/40">
              Paso {paso + 1} de {totalPasos}
            </span>
            <span className="text-xs font-mono text-azul font-medium">{Math.round(progreso)}%</span>
          </div>
          <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-azul rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <form onSubmit={enviar}>
          <AnimatePresence mode="wait">
            {/* PASO 1: Datos personales */}
            {paso === 0 && (
              <Paso key="paso-0">
                <h2 className="font-display text-xl text-ink mb-1">Datos personales</h2>
                <p className="text-ink/50 text-sm mb-6">Los campos con * son obligatorios</p>

                <div className="space-y-5">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      className="input"
                      placeholder="Ej: María"
                      value={form.nombres}
                      onChange={(e) => actualizar('nombres', e.target.value)}
                    />
                    {errores.nombres && <p className="text-rojo text-xs mt-1">{errores.nombres}</p>}
                  </div>
                  <div>
                    <label className="label">Apellido *</label>
                    <input
                      className="input"
                      placeholder="Ej: García"
                      value={form.apellidos}
                      onChange={(e) => actualizar('apellidos', e.target.value)}
                    />
                    {errores.apellidos && <p className="text-rojo text-xs mt-1">{errores.apellidos}</p>}
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button type="button" onClick={siguientePaso} className="btn-gold shadow-gold">
                    Siguiente →
                  </button>
                </div>
              </Paso>
            )}

            {/* PASO 2: Contacto */}
            {paso === 1 && (
              <Paso key="paso-1">
                <h2 className="font-display text-xl text-ink mb-1">Información de contacto</h2>
                <p className="text-ink/50 text-sm mb-6">Celular y correo, además nos ayuda saber tu dirección</p>

                <div className="space-y-5">
                  <div>
                    <label className="label">Número celular *</label>
                    <input
                      className="input"
                      type="tel"
                      placeholder="Ej: 310 123 4567"
                      value={form.telefono}
                      onChange={(e) => actualizar('telefono', e.target.value)}
                    />
                    {errores.telefono && <p className="text-rojo text-xs mt-1">{errores.telefono}</p>}
                  </div>
                  <div>
                    <label className="label">Correo electrónico <span className="text-ink/30">(opcional)</span></label>
                    <input
                      className="input"
                      type="email"
                      placeholder="Ej: maria@gmail.com"
                      value={form.email}
                      onChange={(e) => actualizar('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Barrio <span className="text-ink/30">(opcional)</span></label>
                    <input
                      className="input"
                      placeholder="Ej: Barrio El Progreso"
                      value={form.barrio}
                      onChange={(e) => actualizar('barrio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Dirección <span className="text-ink/30">(opcional)</span></label>
                    <input
                      className="input"
                      placeholder="Ej: Calle 10 #5-20"
                      value={form.direccion}
                      onChange={(e) => actualizar('direccion', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={pasoAnterior} className="btn-ghost">
                    ← Atrás
                  </button>
                  <button type="button" onClick={siguientePaso} className="btn-gold shadow-gold">
                    Siguiente →
                  </button>
                </div>
              </Paso>
            )}

            {/* PASO 3: Extras */}
            {paso === 2 && (
              <Paso key="paso-2">
                <h2 className="font-display text-xl text-ink mb-1">Un poco más sobre ti</h2>
                <p className="text-ink/50 text-sm mb-6">Esto nos ayuda a conocerte mejor</p>

                <div className="space-y-6">
                  <div>
                    <label className="label">¿Quieres contarnos algo adicional? / Petición de oración</label>
                    <textarea
                      className="input min-h-24 resize-none"
                      placeholder="Escribe aquí..."
                      maxLength={MAX_ADICIONAL}
                      value={form.adicional}
                      onChange={(e) => actualizar('adicional', e.target.value)}
                    />
                    <p className="text-xs text-ink/30 text-right mt-1">
                      {form.adicional.length}/{MAX_ADICIONAL}
                    </p>
                  </div>

                  <div>
                    <label className="label">¿Actualmente asistes a otra iglesia? *</label>
                    <div className="flex gap-3 mt-2">
                      {['No', 'Si'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => actualizar('asisteOtraIglesia', op)}
                          className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                            form.asisteOtraIglesia === op
                              ? 'border-azul bg-azul/5 text-azul'
                              : 'border-line text-ink/50 hover:border-azul/30'
                          }`}
                        >
                          {op === 'Si' ? 'Sí' : 'No'}
                        </button>
                      ))}
                    </div>
                    {errores.asisteOtraIglesia && <p className="text-rojo text-xs mt-1">{errores.asisteOtraIglesia}</p>}
                  </div>

                  <div>
                    <label className="label">¿Deseas que te llamemos? *</label>
                    <div className="flex gap-3 mt-2">
                      {['Si', 'No'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => actualizar('desearLlamada', op)}
                          className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                            form.desearLlamada === op
                              ? 'border-azul bg-azul/5 text-azul'
                              : 'border-line text-ink/50 hover:border-azul/30'
                          }`}
                        >
                          {op === 'Si' ? 'Sí' : 'No'}
                        </button>
                      ))}
                    </div>
                    {errores.desearLlamada && <p className="text-rojo text-xs mt-1">{errores.desearLlamada}</p>}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={pasoAnterior} className="btn-ghost">
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="btn-gold shadow-gold disabled:opacity-60"
                  >
                    {enviando ? 'Enviando…' : 'Enviar registro ✓'}
                  </button>
                </div>
              </Paso>
            )}
          </AnimatePresence>
        </form>

        {resultado === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-rojo/10 border border-rojo/20 text-rojo text-sm text-center"
          >
            Hubo un error al enviar tu registro. Intenta de nuevo.
          </motion.div>
        )}
      </section>
    </div>
  );
}
