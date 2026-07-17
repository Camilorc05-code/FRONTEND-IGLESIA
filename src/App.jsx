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
import Visitas from './pages/admin/Visitas';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import BebesAdmin from './pages/admin/BebesAdmin';
import AuditLog from './pages/admin/AuditLog';
import AsistenciaAdmin from './pages/admin/AsistenciaAdmin';
import Donaciones from './pages/Donaciones';
import VisitanteForm from './pages/VisitanteForm';
import Redes from './pages/Redes';
import Checkin from './pages/Checkin';

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
            <Route path="/donaciones" element={<Donaciones />} />
            <Route path="/registrarse" element={<VisitanteForm />} />
            <Route path="/redes" element={<Redes />} />

          </Route>

          {/* Login del panel */}
          <Route path="/admin/login" element={<Login />} />

          {/* Check-in (fuera del shell público) */}
          <Route path="/checkin" element={<Checkin />} />

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
            <Route path="visitas" element={<Visitas />} />
            <Route path="servicios" element={<ServiciosAdmin />} />
            <Route path="eventos" element={<EventosAdmin />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="bebes" element={<BebesAdmin />} />
            <Route path="asistencia" element={<AsistenciaAdmin />} />
            <Route path="historial" element={<AuditLog />} />
          </Route>

          <Route path="*" element={<Inicio />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
