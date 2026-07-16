import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { Magnetic } from '../components/Magnetic';
import { Horizonte } from '../components/Horizonte';

import portadaFB from '../assets/iglesia-interior.jpg';
import reelFB1 from '../assets/redes/reel-fb-1.jpg';
import reelFB2 from '../assets/redes/reel-fb-2.jpg';
import reelFB3 from '../assets/redes/reel-fb-3.jpg';

const FB_URL = 'https://www.facebook.com/share/1D2fXLv3hM/?mibextid=wwXIfr';
const IG_URL = 'https://www.instagram.com/mision_panamericana_pza?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const reelsFB = [
  { url: 'https://www.facebook.com/share/r/1DGmhv9JYD/', id: 'fb-1', thumb: reelFB1, video: '/videos/reel-fb-1.mp4' },
  { url: 'https://www.facebook.com/share/r/17SGqYaMeB/?mibextid=wwXIfr', id: 'fb-2', thumb: reelFB2, video: '/videos/reel-fb-2.mp4' },
  { url: 'https://www.facebook.com/share/r/1LbqYUTt4t/?mibextid=wwXIfr', id: 'fb-3', thumb: reelFB3, video: '/videos/reel-fb-3.mp4' },
];

const reelsIG = [
  { url: 'https://www.instagram.com/reel/DIMoSyrRmA1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-1' },
  { url: 'https://www.instagram.com/reel/C_VqfJTREbw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-2' },
  { url: 'https://www.instagram.com/reel/DGqPVEKRPb8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-3' },
];

function extractIGReelId(url) {
  const m = url.match(/\/reel\/([^/?]+)/);
  return m ? m[1] : null;
}

function FacebookVideoPlayer({ reel, activeId, setActiveId }) {
  const [muted, setMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef(null);
  const isActive = activeId === reel.id;

  function handleFirstPlay(e) {
    e.preventDefault();
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    setHasStarted(true);
    setMuted(false);
    vid.muted = false;
    setActiveId(reel.id);
    vid.play().catch(() => {});
  }

  function togglePlay(e) {
    e.preventDefault();
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.pause();
      setActiveId(null);
    } else {
      setActiveId(reel.id);
      setMuted(false);
      vid.muted = false;
      vid.play().catch(() => {});
    }
  }

  function toggleMute(e) {
    e.preventDefault();
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const newMuted = !muted;
    setMuted(newMuted);
    vid.muted = newMuted;
    if (!newMuted && !isActive) {
      setActiveId(reel.id);
      vid.play().catch(() => {});
    }
  }

  function onPlay() {
    setHasStarted(true);
    setActiveId(reel.id);
  }

  function onPause() {
    if (isActive) setActiveId(null);
  }

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (!isActive && !vid.paused) {
      vid.pause();
      vid.muted = true;
      setMuted(true);
    }
  }, [isActive]);

  return (
    <StaggerItem>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-xl"
      >
        {/* Facebook top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Misión Panamericana</p>
            <p className="text-white/50 text-[10px]">Reel</p>
          </div>
          {hasStarted && (
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {muted ? (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
              )}
            </button>
          )}
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={reel.video}
          poster={reel.thumb}
          loop
          playsInline
          preload="metadata"
          onPlay={onPlay}
          onPause={onPause}
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />

        {/* Play button — starts video with sound */}
        {!hasStarted && (
          <button
            onClick={handleFirstPlay}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group/play"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
              <svg className="w-7 h-7 text-gray-900 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </button>
        )}

        {/* Ver en Facebook */}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto"
        >
          <span className="text-white/70 text-[11px] hover:text-white transition-colors underline">Ver en Facebook ↗</span>
        </a>
      </motion.div>
    </StaggerItem>
  );
}

function InstagramReelCard({ reel }) {
  const igId = extractIGReelId(reel.url);

  return (
    <StaggerItem>
      <div className="group block relative">
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink"
        >
          {igId && (
            <iframe
              src={`https://www.instagram.com/reel/${igId}/embed/`}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; screen-wake-lock"
              title="Reel de Instagram"
            />
          )}
        </motion.div>
      </div>
    </StaggerItem>
  );
}

function PlatformSection({ title, subtitle, icon, color, gradient, url, btnLabel, btnColor, children }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: gradient }} />
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              {icon}
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl" style={{ color }}>{title}</h2>
              <p className="text-ink/50 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-10">
            <a href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${btnColor}`}>
              {btnLabel} →
            </a>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export default function Redes() {
  const [activeFBReel, setActiveFBReel] = useState(null);
  return (
    <div>
      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={portadaFB} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-24 pb-20 text-center relative z-10">
          <Reveal>
            <p className="eyebrow text-gold mb-3">Síguenos</p>
            <h1 className="font-display text-4xl md:text-6xl text-paper mb-6">Nuestras Redes</h1>
            <p className="text-paper/70 max-w-xl mx-auto text-lg leading-relaxed mb-10">
              Sigue nuestras publicaciones, compartimos la palabra, eventos y el día a día de nuestra iglesia.
            </p>
          </Reveal>
          <StaggerGroup className="flex flex-wrap justify-center gap-4" stagger={0.12}>
            <StaggerItem>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white px-7 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#1877F2]/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            </StaggerItem>
            <StaggerItem>
              <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F56040] via-[#C13584] to-[#833AB4] text-white px-7 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#C13584]/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            </StaggerItem>
          </StaggerGroup>
        </div>
        <Horizonte className="text-paper" />
      </section>

      <PlatformSection
        title="Facebook"
        subtitle="@misionpanamericana"
        color="#1877F2"
        gradient="linear-gradient(135deg, #1877F2, #0a5dc2)"
        icon={<svg className="w-6 h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
        url={FB_URL}
        btnLabel="Seguir en Facebook"
        btnColor="bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/20"
      >
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6" stagger={0.1}>
          {reelsFB.map((reel) => (
            <FacebookVideoPlayer key={reel.id} reel={reel} activeId={activeFBReel} setActiveId={setActiveFBReel} />
          ))}
        </StaggerGroup>
      </PlatformSection>

      <PlatformSection
        title="Instagram"
        subtitle="@mision_panamericana_pza"
        color="#C13584"
        gradient="linear-gradient(135deg, #F56040, #C13584, #833AB4)"
        icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="igS3" x1="0" y1="24" x2="24" y2="0"><stop offset="0%" stopColor="#F56040"/><stop offset="50%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igS3)" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="url(#igS3)" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="url(#igS3)"/></svg>}
        url={IG_URL}
        btnLabel="Seguir en Instagram"
        btnColor="bg-gradient-to-r from-[#F56040]/10 via-[#C13584]/10 to-[#833AB4]/10 hover:from-[#F56040]/20 hover:via-[#C13584]/20 hover:to-[#833AB4]/20 text-[#C13584] border border-[#C13584]/20"
      >
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6" stagger={0.1}>
          {reelsIG.map((reel) => (
            <InstagramReelCard key={reel.id} reel={reel} />
          ))}
        </StaggerGroup>
      </PlatformSection>

      <section className="bg-paper2">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 text-center">
          <Reveal>
            <p className="eyebrow text-gold mb-3">¡No te lo pierdas!</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">Síguenos y sé parte</h2>
            <p className="text-ink/50 max-w-lg mx-auto mb-10">Publicamos contenido nuevo cada semana. Palabras de aliento, eventos, actividades y más.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic className="inline-block">
                <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#166FE5] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#1877F2]/25">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Seguir en Facebook
                </a>
              </Magnetic>
              <Magnetic className="inline-block">
                <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F56040] via-[#C13584] to-[#833AB4] text-white px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg shadow-[#C13584]/25">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Seguir en Instagram
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
