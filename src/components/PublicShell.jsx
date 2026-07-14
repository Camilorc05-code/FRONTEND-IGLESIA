import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from './PublicLayout';
import { PageTransition } from './PageTransition';
import { ScrollProgress } from './ScrollProgress';
import { BotonWhatsapp } from './BotonWhatsapp';

export default function PublicShell() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <BotonWhatsapp />
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
