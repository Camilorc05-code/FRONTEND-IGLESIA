import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoMision from '../assets/logo-mision-transparente.png';
import logoCfeTransparente from '../assets/logo-cfe-transparente.png';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/donaciones', label: 'Donaciones' },
  { to: '/citas', label: 'Agendar cita' },
  { to: '/registrarse', label: 'Registrarse' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-40 bg-paper/90 backdrop-blur border-b transition-shadow duration-300 ${
        scrolled ? 'border-line shadow-[0_2px_20px_-4px_rgba(10,42,87,0.12)]' : 'border-transparent'
      }`}
    >
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #024293, #FFCD02, #E1011D)' }}
      />
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logoMision} alt="Misión Panamericana de Colombia" className="w-12 h-12 object-contain" />
          <span className="font-display leading-tight">
            <span className="block text-sm md:text-base font-semibold text-ink">
              Misión Panamericana
            </span>
            <span className="block text-[11px] md:text-xs text-azul font-display italic tracking-wide">
              Centro de Fe y Esperanza
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive ? 'text-rojo' : 'text-ink/70 hover:text-ink'
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] bg-rojo rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
          <Link to="/admin/login" className="btn-outline !py-2 !px-4 text-xs">
            Panel interno
          </Link>
        </nav>

        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <motion.svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-line bg-paper px-5 overflow-hidden"
          >
            <div className="py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `py-2.5 text-sm font-medium ${isActive ? 'text-rojo' : 'text-ink/70'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/admin/login" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium text-azul">
                Panel interno
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper/80 relative">
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #FFCD02, #E1011D, #024293)' }}
      />
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <img src={logoCfeTransparente} alt="Centro de Fe y Esperanza" className="w-14 h-14 object-contain mb-3" />
          <h3 className="font-display text-lg text-paper mb-2">Misión Panamericana</h3>
          <p className="text-sm text-paper/60">Centro de Fe y Esperanza</p>
          <p className="text-sm text-paper/60 mt-1 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Calle 12 #10-19
          </p>
        </div>
        <div>
          <h4 className="eyebrow !text-gold mb-4">Navegación</h4>
          <ul className="space-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold transition-colors inline-flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-gold/60 group-hover:bg-gold transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="eyebrow !text-gold mb-4">Contacto</h4>
          <p className="text-sm text-paper/60 leading-relaxed mb-4">
            Escríbenos o visítanos en un próximo servicio. Todos son bienvenidos.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/share/1D2fXLv3hM/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Misión Panamericana"
              className="w-9 h-9 rounded-full bg-paper/10 hover:bg-gold hover:text-ink flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.23 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.23 22 17.08 22 12.06Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/mision_panamericana_pza?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Misión Panamericana"
              className="w-9 h-9 rounded-full bg-paper/10 hover:bg-gold hover:text-ink flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77c-.55.55-1.11.9-1.77 1.15-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45.53C6.09.28 6.82.11 7.88.06 8.94.01 9.28 0 12 0Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25A3.25 3.25 0 1 1 12 8.5a3.25 3.25 0 0 1 0 6.75ZM18.4 5.6a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
              </svg>
            </a>
            <a
              href="https://wa.me/573132959669"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Misión Panamericana"
              className="w-9 h-9 rounded-full bg-paper/10 hover:bg-gold hover:text-ink flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
                <path d="M16.04 4C9.4 4 4 9.4 4 16.04c0 2.2.6 4.28 1.63 6.06L4 28l6.08-1.6a11.98 11.98 0 0 0 5.96 1.6h.01c6.64 0 12.03-5.4 12.03-12.04C28.08 9.4 22.68 4 16.04 4Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10 text-center text-xs text-paper/40 py-5">
        © {new Date().getFullYear()} Misión Panamericana — Centro de Fe y Esperanza.
      </div>
    </footer>
  );
}
