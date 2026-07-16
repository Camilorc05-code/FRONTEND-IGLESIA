import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Horizonte } from '../components/Horizonte';
import { GlobeGrid } from '../components/GlobeGrid';
import logoMision from '../assets/logo-mision-transparente.png';
import { PlaceholderEvento } from '../components/PlaceholderEvento';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { SkeletonGrid } from '../components/Skeleton';
import { WordReveal } from '../components/WordReveal';
import { MouseParallax, ParallaxLayer } from '../components/MouseParallax';
import { Magnetic } from '../components/Magnetic';
import { TiltCard } from '../components/TiltCard';
import { CountUp } from '../components/CountUp';
import { ProximoServicio } from '../components/ProximoServicio';
import { CarruselEventos } from '../components/CarruselEventos';
import { Particulas } from '../components/Particulas';
import { ImagenParallax } from '../components/ImagenParallax';
import { GaleriaAuto } from '../components/GaleriaAuto';
import { formatTimeRange12h } from '../utils/formatTime';
import fotoBienvenidos from '../assets/bienvenidos.jpg';
import fotoIglesia from '../assets/iglesia-interior.jpg';
import fotoPastor from '../assets/pastor.png';
import fotoFamilia from '../assets/familia-pastoral.jpg';
import fotoFachada from '../assets/fachada-iglesia.jpg';
import logoMiaImg from '../assets/logo-mia.png';
import logoMjpImg from '../assets/logo-mjp.png';

const DIRECCION_IGLESIA = 'Calle 12 #10-19';

export default function Inicio() {
  const [servicios, setServicios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [cargandoEventos, setCargandoEventos] = useState(true);

  useEffect(() => {
    api.get('/servicios').then((r) => setServicios(r.data.slice(0, 4)))
      .catch(() => {}).finally(() => setCargandoServicios(false));
    api.get('/eventos?tipo=proximos').then((r) => setEventos(r.data.slice(0, 8)))
      .catch(() => {}).finally(() => setCargandoEventos(false));
    api.get('/eventos/categorias').then((r) => setCategorias(r.data)).catch(() => {});
  }, []);

  const fotosServicios = servicios.flatMap((s) => [
    ...(s.imagenUrl ? [s.imagenUrl] : []),
    ...(s.imagenes || []).map((img) => img.url),
  ]);

  const fotosEventos = eventos.flatMap((e) => [
    ...(e.imagenUrl ? [e.imagenUrl] : []),
    ...(e.imagenes || []).map((img) => img.url),
  ]);

  return (
    <div>
      {/* HERO */}
      <MouseParallax className="relative bg-amanecer overflow-hidden">
        {({ mvX, mvY }) => (
          <>
            <ImagenParallax
              src={fotoFachada}
              alt="Fachada de Misión Panamericana - Centro de Fe y Esperanza"
              recorrido={30}
              imgStyle={{ filter: 'saturate(0.95)' }}
            />
            <div className="absolute inset-0 bg-amanecer opacity-[0.82]" />

            <div className="pointer-events-none absolute inset-0">
              <ParallaxLayer
                mvX={mvX} mvY={mvY} depth={-14}
                className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-azul/10 blur-3xl"
                animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              />
              <ParallaxLayer
                mvX={mvX} mvY={mvY} depth={18}
                className="absolute top-10 right-0 w-80 h-80 rounded-full bg-rojo/10 blur-3xl"
                animate={{ scale: [1, 1.22, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <ParallaxLayer
                mvX={mvX} mvY={mvY} depth={-10}
                className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-indigo/10 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />
              <Particulas count={16} />
            </div>

            <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 pb-28 md:pt-24 md:pb-36 relative z-10">
              <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-14 md:gap-8 items-center">
                <div>
                  <motion.p
                    className="eyebrow mb-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Paz de Ariporo · Casanare
                  </motion.p>

                  <h1 className="text-ink">
                    <span className="block font-display font-semibold text-base md:text-lg tracking-[0.28em] text-azul uppercase mb-3">
                      <WordReveal text="Bienvenidos" delay={0.1} />
                    </span>
                    <span className="block font-display font-semibold text-[2.5rem] leading-[1.08] md:text-6xl lg:text-7xl tracking-tight">
                      <motion.span
                        className="inline-block bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradientshift_6s_ease-in-out_infinite]"
                        style={{ backgroundImage: 'linear-gradient(90deg, #024293, #3E52C3, #024293)' }}
                        initial={{ opacity: 0, y: '50%' }}
                        animate={{ opacity: 1, y: '0%' }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        Nos alegra verte en casa
                      </motion.span>
                    </span>
                  </h1>

                  <motion.p
                    className="text-ink/70 max-w-md mt-7 text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.85 }}
                  >
                    Misión Panamericana — Centro de Fe y Esperanza te espera con las puertas abiertas,
                    cada semana, para caminar juntos en comunidad.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 mt-9"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.95 }}
                  >
                    <Magnetic>
                      <Link to="/horarios" className="btn-gold shadow-gold">
                        Ver horarios de servicio
                        <span aria-hidden="true">→</span>
                      </Link>
                    </Magnetic>
                    <Magnetic strength={0.25}>
                      <Link to="/registrarse" className="btn-outline">
                        Soy nuevo — Quiero registrarme
                      </Link>
                    </Magnetic>
                    <Magnetic strength={0.25}>
                      <Link to="/citas" className="btn-outline">Agendar una cita</Link>
                    </Magnetic>
                    <Magnetic strength={0.25}>
                      <a href="#ubicacion" className="btn-outline">
                        Cómo llegar
                        <span aria-hidden="true">↓</span>
                      </a>
                    </Magnetic>
                  </motion.div>

                  {servicios.length > 0 && (
                    <motion.div
                      className="mt-8"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.05 }}
                    >
                      <ProximoServicio servicios={servicios} />
                    </motion.div>
                  )}
                </div>

                <motion.div
                  className="relative flex justify-center md:justify-end"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ParallaxLayer mvX={mvX} mvY={mvY} depth={-22}>
                    <GlobeGrid
                      className="absolute w-[26rem] h-[26rem] text-azul animate-[spin_60s_linear_infinite]"
                      opacity={0.12}
                    />
                  </ParallaxLayer>
                  <div className="absolute w-64 h-64 md:w-72 md:h-72 rounded-full bg-gold/25 blur-2xl" />
                  <ParallaxLayer mvX={mvX} mvY={mvY} depth={-30}>
                    <img
                      src={logoMision}
                      alt="Misión Panamericana de Colombia"
                      className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-xl animate-float"
                    />
                  </ParallaxLayer>
                </motion.div>
              </div>

              <motion.div
                className="hidden md:flex justify-center mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-6 h-10 rounded-full border-2 border-ink/20 flex items-start justify-center p-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-ink/40" />
                </motion.div>
              </motion.div>
            </div>
            <Horizonte className="text-paper absolute bottom-0 left-0 text-paper" />
          </>
        )}
      </MouseParallax>

      {/* FRANJA DE VERSÍCULO */}
      <section className="bg-ink relative overflow-hidden">
        <GlobeGrid className="absolute -right-24 -top-24 w-96 h-96 text-paper" opacity={0.06} />
        <Reveal className="max-w-3xl mx-auto px-5 md:px-8 py-10 text-center relative">
          <p className="font-display text-xl md:text-2xl text-paper italic leading-relaxed">
            "Todo lo puedo en Cristo que me fortalece."
          </p>
          <p className="font-mono text-xs text-gold uppercase tracking-widest mt-3">Filipenses 4:13</p>
        </Reveal>
      </section>

      {/* CONTADORES */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
          <StaggerGroup className="grid grid-cols-3 gap-6 text-center">
            <StaggerItem>
              <p className="font-display text-4xl md:text-5xl text-azul">
                <CountUp value={servicios.length || 4} />
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 mt-1">
                Servicios semanales
              </p>
            </StaggerItem>
            <StaggerItem>
              <p className="font-display text-4xl md:text-5xl text-rojo">
                <CountUp value={categorias.length || 9} />
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 mt-1">
                Categorías de eventos
              </p>
            </StaggerItem>
            <StaggerItem>
              <p className="font-display text-4xl md:text-5xl text-gold-dark">
                <CountUp value={2} />
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50 mt-1">
                Ministerios activos
              </p>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* BIENVENIDA */}
      <section className="bg-paper">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <Reveal delay={0.05} className="order-2 md:order-1">
            <p className="eyebrow mb-3">Un lugar para todos</p>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-4">
              Más que una iglesia, una familia.
            </h2>
            <p className="text-ink/70 leading-relaxed max-w-md">
              Cada rostro cuenta una historia, y en Misión Panamericana queremos ser parte de la tuya.
              Nuestro equipo de bienvenida está listo para recibirte con los brazos abiertos.
            </p>
            <p className="text-ink/50 text-sm mt-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {DIRECCION_IGLESIA}
            </p>
          </Reveal>
          <Reveal className="order-1 md:order-2">
            <TiltCard max={5} className="relative rounded-3xl overflow-hidden shadow-brand aspect-[4/5]">
              <ImagenParallax
                src={fotoBienvenidos}
                alt="Equipo de bienvenida recibiendo a la congregación en Misión Panamericana"
                recorrido={35}
              />
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* PRÓXIMOS SERVICIOS + GALERÍA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <p className="eyebrow mb-3">Cada semana</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">Nuestros horarios</h2>
        </Reveal>

        {fotosServicios.length > 0 && (
          <Reveal className="mb-10">
            <GaleriaAuto
              imagenes={fotosServicios}
              alt="Galería de servicios"
              className="shadow-brand"
              intervalo={5000}
            />
          </Reveal>
        )}

        {cargandoServicios ? (
          <SkeletonGrid count={4} cols="md:grid-cols-4" />
        ) : servicios.length === 0 ? (
          <p className="text-ink/50">Aún no hay horarios publicados.</p>
        ) : (
          <StaggerGroup className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {servicios.map((s) => (
              <StaggerItem key={s.id}>
                <div className="card h-full hover:shadow-brand-sm hover:-translate-y-1 hover:border-gold overflow-hidden">
                  {(s.imagenUrl || s.imagenes?.length > 0) && (
                    <div className="h-28 -mx-6 -mt-6 mb-3 overflow-hidden">
                      <img
                        src={s.imagenUrl || s.imagenes?.[0]?.url}
                        alt={s.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="font-mono text-xs text-azul uppercase tracking-wide mb-2">
                    {s.diaSemana}
                  </p>
                  <h3 className="font-display text-lg text-ink mb-1 leading-snug">{s.nombre}</h3>
                  <p className="font-mono text-sm text-rojo">
                    {formatTimeRange12h(s.horaInicio, s.horaFin)}
                  </p>
                  {s.lugar && <p className="text-sm text-ink/60 mt-2">📍 {s.lugar}</p>}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
        <Reveal delay={0.1}>
          <Link to="/horarios" className="inline-block mt-8 text-azul font-semibold text-sm hover:text-rojo transition-colors">
            Ver todos los horarios →
          </Link>
        </Reveal>
      </section>

      <Horizonte className="text-paper2" />

      {/* IGLESIA EN COMUNIDAD */}
      <section className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <ImagenParallax
          src={fotoIglesia}
          alt="Congregación de Misión Panamericana reunida en un servicio"
          recorrido={55}
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative h-full flex items-center justify-center text-center px-5">
          <Reveal>
            <p className="font-display italic text-2xl md:text-4xl text-paper max-w-2xl leading-snug">
              "Así vivimos la fe, semana tras semana, como una sola familia."
            </p>
          </Reveal>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS + GALERÍA */}
      <section className="bg-paper2">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <Reveal>
            <p className="eyebrow mb-3">No te lo pierdas</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">Próximos eventos</h2>
          </Reveal>

          {fotosEventos.length > 0 && (
            <Reveal className="mb-10">
              <GaleriaAuto
                imagenes={fotosEventos}
                alt="Galería de eventos"
                className="shadow-brand"
                intervalo={5500}
              />
            </Reveal>
          )}

          {cargandoEventos ? (
            <SkeletonGrid count={3} />
          ) : eventos.length === 0 ? (
            <p className="text-ink/50">No hay eventos próximos por ahora. Vuelve pronto.</p>
          ) : (
            <Reveal delay={0.05}>
              <CarruselEventos eventos={eventos} />
            </Reveal>
          )}
        </div>
      </section>

      {/* MINISTERIOS */}
      <section className="bg-paper2 relative overflow-hidden">
        <GlobeGrid className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 text-azul animate-[spin_90s_linear_infinite]" opacity={0.05} />
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 relative">
          <Reveal>
            <p className="eyebrow mb-3">Servimos juntos</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">Nuestros ministerios</h2>
          </Reveal>
          <StaggerGroup className="grid sm:grid-cols-2 gap-6">
            <StaggerItem>
              <TiltCard max={6} className="card bg-white h-full flex items-center gap-5 shadow-brand-sm hover:border-azul overflow-hidden">
                <div className="relative shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-azul/15 blur-xl"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <img src={logoMiaImg} alt="Logo M.I.A - Ministerios Infantiles y Adolescentes" className="relative w-20 h-20 object-contain" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink">M.I.A</h3>
                  <p className="text-sm text-ink/60 mt-1">
                    Ministerios Infantiles y Adolescentes — formando a los más pequeños en la fe con amor y creatividad.
                  </p>
                </div>
              </TiltCard>
            </StaggerItem>
            <StaggerItem>
              <TiltCard max={6} className="card bg-white h-full flex items-center gap-5 shadow-brand-sm hover:border-gold overflow-hidden">
                <div className="relative shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/20 blur-xl"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  />
                  <img src={logoMjpImg} alt="Logo M.J.P - Ministerio Juvenil Panamericano" className="relative w-20 h-20 object-contain" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink">M.J.P</h3>
                  <p className="text-sm text-ink/60 mt-1">
                    Ministerio Juvenil Panamericano — un espacio para crecer, servir y encender la próxima generación.
                  </p>
                </div>
              </TiltCard>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      <Horizonte flip className="text-paper2" />

      {/* CONOCE A NUESTRO PASTOR */}
      <section className="bg-paper2 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <Reveal>
            <p className="eyebrow mb-3">Nuestro liderazgo</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">Conoce a nuestro pastor</h2>
          </Reveal>

          <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-14 md:gap-10 items-center">
            <Reveal>
              <div className="flex flex-col items-center gap-5">
                <TiltCard max={7} className="relative flex justify-center">
                  <motion.div
                    className="absolute w-60 h-60 md:w-72 md:h-72 rounded-full bg-gold/25 blur-3xl"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute w-52 h-52 md:w-64 md:h-64 rounded-full bg-azul/10 blur-2xl top-4" />
                  <img
                    src={fotoPastor}
                    alt="Pastor Marcolino Rodríguez"
                    className="relative w-56 md:w-72 object-contain drop-shadow-xl"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
                      maskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
                    }}
                  />
                </TiltCard>

                <TiltCard max={6} className="w-full max-w-xs rounded-2xl overflow-hidden border border-line shadow-brand-sm bg-white">
                  <div className="aspect-[3/4] overflow-hidden">
                    <motion.img
                      src={fotoFamilia}
                      alt="Pastor Marcolino Rodríguez junto a su familia"
                      className="w-full h-full object-cover object-center"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-azul text-center py-2">
                    Junto a su familia
                  </p>
                </TiltCard>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="eyebrow mb-2">Pastor principal</p>
              <h3 className="font-display font-semibold text-3xl md:text-4xl text-azul mb-4">
                Marcolino Rodríguez
              </h3>
              <p className="text-ink/70 leading-relaxed mb-4">
                Con años dedicados al servicio de la comunidad, el pastor Marcolino
                ha guiado a Misión Panamericana con un corazón cercano y una pasión genuina por ver
                vidas transformadas por la fe.
              </p>
              <p className="text-ink/70 leading-relaxed">
                Junto a su familia, dedica su vida a predicar la Palabra, acompañar a cada hogar de la
                congregación y sostener con esperanza a quienes más lo necesitan.
              </p>
              <p className="text-ink/50 text-sm mt-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {DIRECCION_IGLESIA}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* UBICACIÓN / MAPA */}
      <section id="ubicacion" className="bg-paper2">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <Reveal>
              <div>
                <p className="eyebrow mb-3">Encuéntranos</p>
                <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">
                  Nuestra ubicación
                </h2>
                <p className="text-ink/70 leading-relaxed mb-6">
                  Estamos en el corazón de Paz de Ariporo, Casanare. Ven a visitarnos en cualquiera
                  de nuestros servicios — eres bienvenido.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="flex items-center gap-3 text-ink/70">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rojo shrink-0">
                      <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {DIRECCION_IGLESIA}
                  </p>
                  <p className="flex items-center gap-3 text-ink/70">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-azul shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Paz de Ariporo, Casanare
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Calle+12+%2310-19,+Paz+de+Ariporo,+Casanare,+Colombia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold shadow-gold inline-flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Cómo llegar
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Calle+12+%2310-19,+Paz+de+Ariporo,+Casanare,+Colombia"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border border-line shadow-brand aspect-[4/3] bg-ink/5 relative group"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.5!2d-71.9!3d5.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwNTInNDguMCJOIDcxxoDUOS4wIlA!5e0!3m2!1ses!2sco!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Misión Panamericana"
                />
                <div className="absolute inset-0 bg-azul/0 group-hover:bg-azul/5 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-azul text-paper text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                    Abrir en Google Maps
                  </span>
                </div>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA CITAS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">
            ¿Necesitas hablar con un pastor?
          </h2>
          <p className="text-ink/70 max-w-lg mx-auto mb-2">
            Agenda una cita pastoral en el horario que más te convenga. Estamos aquí para ti.
          </p>
          <p className="text-ink/50 text-sm mb-8 flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {DIRECCION_IGLESIA}
          </p>
          <Magnetic className="inline-block">
            <Link to="/citas" className="btn-gold shadow-gold">Agendar cita ahora</Link>
          </Magnetic>
        </Reveal>
      </section>

      {/* REDES SOCIALES */}
      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rojo rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center relative z-10">
          <Reveal>
            <p className="eyebrow text-gold mb-3">Síguenos</p>
            <h2 className="font-display text-3xl md:text-4xl text-paper mb-4">
              Conéctate con nosotros
            </h2>
            <p className="text-paper/60 max-w-lg mx-auto mb-12">
              Sigue nuestras publicaciones, compartimos la palabra, eventos y el día a día de nuestra iglesia.
            </p>
          </Reveal>
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto" stagger={0.15}>
            <StaggerItem>
              <a
                href="https://www.facebook.com/share/1D2fXLv3hM/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-paper/5 hover:bg-paper/10 border border-paper/10 hover:border-gold/30 rounded-2xl p-8 transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#1877F2]/20 flex items-center justify-center group-hover:bg-[#1877F2]/30 transition-colors">
                  <svg className="w-8 h-8 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl text-paper mb-2">Facebook</h3>
                <p className="text-paper/40 text-sm">Misión Panamericana</p>
                <p className="text-gold text-sm mt-3 group-hover:underline">Seguir en Facebook →</p>
              </a>
            </StaggerItem>
            <StaggerItem>
              <a
                href="https://www.instagram.com/mision_panamericana_pza?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-paper/5 hover:bg-paper/10 border border-paper/10 hover:border-rojo/30 rounded-2xl p-8 transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#F56040]/20 via-[#C13584]/20 to-[#833AB4]/20 flex items-center justify-center group-hover:from-[#F56040]/30 group-hover:via-[#C13584]/30 group-hover:to-[#833AB4]/30 transition-colors">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="igGrad" x1="0" y1="24" x2="24" y2="0">
                        <stop offset="0%" stopColor="#F56040"/>
                        <stop offset="50%" stopColor="#C13584"/>
                        <stop offset="100%" stopColor="#833AB4"/>
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igGrad)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" stroke="url(#igGrad)" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#igGrad)"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl text-paper mb-2">Instagram</h3>
                <p className="text-paper/40 text-sm">@mision_panamericana_pza</p>
                <p className="text-rojo text-sm mt-3 group-hover:underline">Seguir en Instagram →</p>
              </a>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}
