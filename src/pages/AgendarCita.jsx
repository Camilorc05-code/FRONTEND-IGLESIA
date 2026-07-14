import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { Reveal } from '../components/Reveal';

const HORAS_DISPONIBLES = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default function AgendarCita() {
  const [pastores, setPastores] = useState([]);
  const [form, setForm] = useState({
    nombreSolicitante: '',
    telefonoSolicitante: '',
    emailSolicitante: '',
    pastorId: '',
    fecha: '',
    hora: '',
    motivo: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok: bool, mensaje }

  useEffect(() => {
    api.get('/citas/pastores-disponibles').then((r) => setPastores(r.data)).catch(() => {});
  }, []);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);
    try {
      const { data } = await api.post('/citas', form);
      setResultado({ ok: true, mensaje: data.mensaje });
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#024293', '#FFCD02', '#E1011D', '#3E52C3'],
      });
      setForm({
        nombreSolicitante: '',
        telefonoSolicitante: '',
        emailSolicitante: '',
        pastorId: '',
        fecha: '',
        hora: '',
        motivo: '',
      });
    } catch (err) {
      setResultado({
        ok: false,
        mensaje: err.response?.data?.error || 'No se pudo agendar la cita. Intenta de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  }

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div>
      <section className="bg-amanecer">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center">
          <Reveal>
            <p className="eyebrow mb-3">Estamos aquí para ti</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Agenda una cita pastoral</h1>
            <p className="text-ink/70 max-w-lg mx-auto mt-4">
              Cuéntanos qué necesitas y con quién quieres hablar. Te confirmaremos por teléfono.
            </p>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      <section className="max-w-xl mx-auto px-5 md:px-8 py-14">
        <AnimatePresence mode="wait">
        {resultado ? (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`card text-center ${resultado.ok ? 'border-azul' : 'border-rojo'}`}
          >
            <p className={`font-display text-xl mb-2 ${resultado.ok ? 'text-azul' : 'text-rojo'}`}>
              {resultado.ok ? '¡Solicitud enviada!' : 'Algo salió mal'}
            </p>
            <p className="text-ink/70">{resultado.mensaje}</p>
            {resultado.ok && (
              <button onClick={() => setResultado(null)} className="btn-outline mt-6">
                Agendar otra cita
              </button>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onSubmit={enviar}
            className="space-y-5"
          >
            <div>
              <label className="label">Nombre completo *</label>
              <input
                required
                className="input"
                value={form.nombreSolicitante}
                onChange={(e) => actualizar('nombreSolicitante', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Teléfono *</label>
                <input
                  required
                  type="tel"
                  className="input"
                  value={form.telefonoSolicitante}
                  onChange={(e) => actualizar('telefonoSolicitante', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Correo (opcional)</label>
                <input
                  type="email"
                  className="input"
                  value={form.emailSolicitante}
                  onChange={(e) => actualizar('emailSolicitante', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">¿Con quién deseas hablar? *</label>
              <select
                required
                className="input"
                value={form.pastorId}
                onChange={(e) => actualizar('pastorId', e.target.value)}
              >
                <option value="">Selecciona un pastor</option>
                {pastores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha *</label>
                <input
                  required
                  type="date"
                  min={hoy}
                  className="input"
                  value={form.fecha}
                  onChange={(e) => actualizar('fecha', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Hora *</label>
                <select
                  required
                  className="input"
                  value={form.hora}
                  onChange={(e) => actualizar('hora', e.target.value)}
                >
                  <option value="">Selecciona</option>
                  {HORAS_DISPONIBLES.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">¿En qué podemos ayudarte? (opcional)</label>
              <textarea
                className="input min-h-24"
                value={form.motivo}
                onChange={(e) => actualizar('motivo', e.target.value)}
              />
            </div>

            {resultado === null && (
              <button type="submit" disabled={enviando} className="btn-gold w-full disabled:opacity-60">
                {enviando ? 'Enviando…' : 'Solicitar cita'}
              </button>
            )}
          </motion.form>
        )}
        </AnimatePresence>
      </section>
    </div>
  );
}
