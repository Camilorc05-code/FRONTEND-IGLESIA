import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IntroSplash } from './components/IntroSplash';

import PublicShell from './components/PublicShell';
import Inicio from './pages/Inicio';
import Horarios from './pages/Horarios';
import Eventos from './pages/Eventos';
import EventoDetalle from './pages/EventoDetalle';
import AgendarCita from './pages/AgendarCita';

import Login from './pages/admin/Login';
import AdminLayout, { RutaProtegida } from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Personas from './pages/admin/Personas';
import Citas from './pages/admin/Citas';
import ServiciosAdmin from './pages/admin/ServiciosAdmin';
import EventosAdmin from './pages/admin/EventosAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <IntroSplash />
      <AuthProvider>
        <Routes>
          {/* Sitio público */}
          <Route element={<PublicShell />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<EventoDetalle />} />
            <Route path="/citas" element={<AgendarCita />} />
          </Route>

          {/* Login del panel */}
          <Route path="/admin/login" element={<Login />} />

          {/* Panel administrativo protegido */}
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <AdminLayout />
              </RutaProtegida>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="personas" element={<Personas />} />
            <Route path="citas" element={<Citas />} />
            <Route path="servicios" element={<ServiciosAdmin />} />
            <Route path="eventos" element={<EventosAdmin />} />
          </Route>

          <Route path="*" element={<Inicio />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
