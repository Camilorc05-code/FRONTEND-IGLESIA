import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { Magnetic } from '../components/Magnetic';
import { Horizonte } from '../components/Horizonte';

import portadaFB from '../assets/redes/portada-facebook.jpg';
import pantallazoFB from '../assets/redes/pantallazo-facebook.jpg';
import pantallazoIG from '../assets/redes/pantallazo-instagram.jpg';
import reelFB1 from '../assets/redes/reel-fb-1.jpg';
import reelFB2 from '../assets/redes/reel-fb-2.jpg';
import reelFB3 from '../assets/redes/reel-fb-3.jpg';
import reelIG1 from '../assets/redes/reel-ig-1.jpg';
import reelIG2 from '../assets/redes/reel-ig-2.jpg';
import reelIG3 from '../assets/redes/reel-ig-3.jpg';

const FB_URL = 'https://www.facebook.com/share/1D2fXLv3hM/?mibextid=wwXIfr';
const IG_URL = 'https://www.instagram.com/mision_panamericana_pza?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const reelsFB = [
  { url: 'https://www.facebook.com/share/r/1DGmhv9JYD/', id: 'fb-1', thumb: reelFB1 },
  { url: 'https://www.facebook.com/share/r/17SGqYaMeB/?mibextid=wwXIfr', id: 'fb-2', thumb: reelFB2 },
  { url: 'https://www.facebook.com/share/r/1LbqYUTt4t/?mibextid=wwXIfr', id: 'fb-3', thumb: reelFB3 },
];

const reelsIG = [
  { url: 'https://www.instagram.com/reel/DIMoSyrRmA1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-1', thumb: reelIG1 },
  { url: 'https://www.instagram.com/reel/C_VqfJTREbw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-2', thumb: reelIG2 },
  { url: 'https://www.instagram.com/reel/DGqPVEKRPb8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', id: 'ig-3', thumb: reelIG3 },
];

function ReelCard({ reel, platform, color }) {
  return (
    <StaggerItem>
      <a href={reel.url} target="_blank" rel="noopener noreferrer" className="group block">
        <motion.div
          whileHover={{ scale: 1.04, y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative aspect-[9/16] rounded-2xl overflow-hidden"
        >
          <img src={reel.thumb} alt={`Reel de ${platform}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:bg-white/40 group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
                {platform === 'facebook' ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                )}
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">
                {platform === 'facebook' ? 'Facebook Reel' : 'Instagram Reel'}
              </span>
            </div>
          </div>
        </motion.div>
      </a>
    </StaggerItem>
  );
}

function PlatformSection({ title, subtitle, icon, color, gradient, reels, platform, url, btnLabel, btnColor, screenshot }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: gradient }} />
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}20` }}>
              {icon}
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-paper">{title}</h2>
              <p className="text-paper/50 text-sm mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-10">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${btnColor}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              {btnLabel}
            </a>
          </div>
        </Reveal>

        {screenshot && (
          <Reveal>
            <a href={url} target="_blank" rel="noopener noreferrer" className="group block mb-12">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative rounded-2xl overflow-hidden border border-paper/10 shadow-xl"
              >
                <img src={screenshot} alt={`Página de ${title}`} className="w-full h-auto object-cover max-h-80" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-paper text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    Visitar página →
                  </span>
                </div>
              </motion.div>
            </a>
          </Reveal>
        )}

        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6" stagger={0.12}>
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} color={color} platform={platform} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export default function Redes() {
  return (
    <div>
      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={portadaFB} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-ink/80" />
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-20 pb-16 text-center relative z-10">
          <Reveal>
            <p className="eyebrow text-gold mb-3">Síguenos</p>
            <h1 className="font-display text-4xl md:text-6xl text-paper mb-6">Nuestras Redes</h1>
            <p className="text-paper/60 max-w-xl mx-auto text-lg leading-relaxed">
              Sigue nuestras publicaciones, compartimos la palabra, eventos y el día a día de nuestra iglesia.
            </p>
          </Reveal>
          <StaggerGroup className="flex flex-wrap justify-center gap-4 mt-10" stagger={0.12}>
            <StaggerItem>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-paper px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </StaggerItem>
            <StaggerItem>
              <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F56040]/15 via-[#C13584]/15 to-[#833AB4]/15 border border-[#C13584]/30 text-paper px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igNav" x1="0" y1="24" x2="24" y2="0">
                      <stop offset="0%" stopColor="#F56040"/>
                      <stop offset="50%" stopColor="#C13584"/>
                      <stop offset="100%" stopColor="#833AB4"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igNav)" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" stroke="url(#igNav)" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="url(#igNav)"/>
                </svg>
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
        icon={<svg className="w-7 h-7 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
        reels={reelsFB}
        platform="facebook"
        url={FB_URL}
        btnLabel="Seguir en Facebook"
        btnColor="bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/30"
        screenshot={pantallazoFB}
      />

      <PlatformSection
        title="Instagram"
        subtitle="@mision_panamericana_pza"
        color="#C13584"
        gradient="linear-gradient(135deg, #F56040, #C13584, #833AB4)"
        icon={<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="igGradS" x1="0" y1="24" x2="24" y2="0"><stop offset="0%" stopColor="#F56040"/><stop offset="50%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#igGradS)" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="url(#igGradS)" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="url(#igGradS)"/></svg>}
        reels={reelsIG}
        platform="instagram"
        url={IG_URL}
        btnLabel="Seguir en Instagram"
        btnColor="bg-gradient-to-r from-[#F56040]/15 via-[#C13584]/15 to-[#833AB4]/15 hover:from-[#F56040]/25 hover:via-[#C13584]/25 hover:to-[#833AB4]/25 text-[#C13584] border border-[#C13584]/30"
        screenshot={pantallazoIG}
      />

      <section className="bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-20 text-center relative z-10">
          <Reveal>
            <p className="eyebrow text-gold mb-3">¡No te lo pierdas!</p>
            <h2 className="font-display text-3xl md:text-4xl text-paper mb-4">Síguenos y sé parte</h2>
            <p className="text-paper/50 max-w-lg mx-auto mb-10">
              Publicamos contenido nuevo cada semana. Palabras de aliento, eventos, actividades y más.
            </p>
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
