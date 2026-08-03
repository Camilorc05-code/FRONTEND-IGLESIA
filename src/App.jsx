import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IntroSplash } from './components/IntroSplash';
import PageLoader from './components/PageLoader';
import PublicShell from './components/PublicShell';
import { useReducedMotion } from './utils/performance';

const Inicio = lazy(() => import('./pages/Inicio'));
const Horarios = lazy(() => import('./pages/Horarios'));
const Eventos = lazy(() => import('./pages/Eventos'));
const EventoDetalle = lazy(() => import('./pages/EventoDetalle'));
const AgendarCita = lazy(() => import('./pages/AgendarCita'));
const Donaciones = lazy(() => import('./pages/Donaciones'));
const VisitanteForm = lazy(() => import('./pages/VisitanteForm'));
const Redes = lazy(() => import('./pages/Redes'));
const Checkin = lazy(() => import('./pages/Checkin'));

const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Personas = lazy(() => import('./pages/admin/Personas'));
const Citas = lazy(() => import('./pages/admin/Citas'));
const ServiciosAdmin = lazy(() => import('./pages/admin/ServiciosAdmin'));
const EventosAdmin = lazy(() => import('./pages/admin/EventosAdmin'));
const Visitas = lazy(() => import('./pages/admin/Visitas'));
const UsuariosAdmin = lazy(() => import('./pages/admin/UsuariosAdmin'));
const BebesAdmin = lazy(() => import('./pages/admin/BebesAdmin'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog'));
const AsistenciaAdmin = lazy(() => import('./pages/admin/AsistenciaAdmin'));
const Contabilidad = lazy(() => import('./pages/admin/Contabilidad'));
const Alertas = lazy(() => import('./pages/admin/Alertas'));

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RutaProtegida({ children }) {
  const { usuario } = useAuth();
  const token = localStorage.getItem('token');
  if (!usuario || !token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <BrowserRouter>
        <ScrollToTop />
        <PageLoader />
        <IntroSplash />
        <AuthProvider>
          <Routes>
            {/* Sitio público */}
            <Route element={<PublicShell />}>
              <Route path="/" element={<SuspenseWrapper><Inicio /></SuspenseWrapper>} />
              <Route path="/horarios" element={<SuspenseWrapper><Horarios /></SuspenseWrapper>} />
              <Route path="/eventos" element={<SuspenseWrapper><Eventos /></SuspenseWrapper>} />
              <Route path="/eventos/:id" element={<SuspenseWrapper><EventoDetalle /></SuspenseWrapper>} />
              <Route path="/citas" element={<SuspenseWrapper><AgendarCita /></SuspenseWrapper>} />
              <Route path="/donaciones" element={<SuspenseWrapper><Donaciones /></SuspenseWrapper>} />
              <Route path="/registrarse" element={<SuspenseWrapper><VisitanteForm /></SuspenseWrapper>} />
              <Route path="/redes" element={<SuspenseWrapper><Redes /></SuspenseWrapper>} />
            </Route>

            {/* Login del panel */}
            <Route path="/admin/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />

            {/* Check-in (fuera del shell público) */}
            <Route path="/checkin" element={<SuspenseWrapper><Checkin /></SuspenseWrapper>} />

            {/* Panel administrativo protegido */}
            <Route
              path="/admin"
              element={
                <RutaProtegida>
                  <SuspenseWrapper>
                    <AdminLayout />
                  </SuspenseWrapper>
                </RutaProtegida>
              }
            >
              <Route index element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
              <Route path="personas" element={<SuspenseWrapper><Personas /></SuspenseWrapper>} />
              <Route path="citas" element={<SuspenseWrapper><Citas /></SuspenseWrapper>} />
              <Route path="visitas" element={<SuspenseWrapper><Visitas /></SuspenseWrapper>} />
              <Route path="servicios" element={<SuspenseWrapper><ServiciosAdmin /></SuspenseWrapper>} />
              <Route path="eventos" element={<SuspenseWrapper><EventosAdmin /></SuspenseWrapper>} />
              <Route path="usuarios" element={<SuspenseWrapper><UsuariosAdmin /></SuspenseWrapper>} />
              <Route path="bebes" element={<SuspenseWrapper><BebesAdmin /></SuspenseWrapper>} />
              <Route path="asistencia" element={<SuspenseWrapper><AsistenciaAdmin /></SuspenseWrapper>} />
              <Route path="contabilidad" element={<SuspenseWrapper><Contabilidad /></SuspenseWrapper>} />
              <Route path="alertas" element={<SuspenseWrapper><Alertas /></SuspenseWrapper>} />
              <Route path="historial" element={<SuspenseWrapper><AuditLog /></SuspenseWrapper>} />
            </Route>

            <Route path="*" element={<SuspenseWrapper><Inicio /></SuspenseWrapper>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
