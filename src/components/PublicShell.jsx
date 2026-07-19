import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from './PublicLayout';
import { PageTransition } from './PageTransition';
import { ScrollProgress } from './ScrollProgress';
import { BotonWhatsapp } from './BotonWhatsapp';
import { ChatBot } from './ChatBot';

export default function PublicShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <BotonWhatsapp />
      <ChatBot />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
