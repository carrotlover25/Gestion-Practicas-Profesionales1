import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegistroPage } from './pages/auth/RegistroPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { VacantesListPage } from './pages/vacantes/VacantesListPage';
import { CrearVacantePage } from './pages/vacantes/CrearVacantePage';
import { VacanteDetailPage } from './pages/vacantes/VacanteDetailPage';
import { MisPostulacionesPage } from './pages/postulaciones/MisPostulacionesPage';
import { PracticasListPage } from './pages/practicas/PracticasListPage';
import { ControlHorasPage } from './pages/horas/ControlHorasPage';
import { IncidenciasPage } from './pages/incidencias/IncidenciasPage';
import { EvaluacionesPage } from './pages/evaluaciones/EvaluacionesPage';
import { NotificacionesPage } from './pages/notificaciones/NotificacionesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          {/* Rutas protegidas dentro del Layout institucional */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Vacantes */}
              <Route path="/vacantes" element={<VacantesListPage />} />
              <Route path="/vacantes/:id" element={<VacanteDetailPage />} />
              <Route
                path="/vacantes/crear"
                element={
                  <ProtectedRoute allowedRoles={['empresa']} />
                }
              >
                <Route index element={<CrearVacantePage />} />
              </Route>

              {/* Postulaciones */}
              <Route
                path="/mis-postulaciones"
                element={
                  <ProtectedRoute allowedRoles={['estudiante']} />
                }
              >
                <Route index element={<MisPostulacionesPage />} />
              </Route>

              {/* Prácticas */}
              <Route path="/practicas" element={<PracticasListPage />} />

              {/* Horas */}
              <Route path="/control-horas" element={<ControlHorasPage />} />

              {/* Incidencias */}
              <Route path="/incidencias" element={<IncidenciasPage />} />
              <Route path="/incidencias/historial" element={<IncidenciasPage />} />

              {/* Evaluaciones y Certificados */}
              <Route path="/evaluaciones" element={<EvaluacionesPage />} />

              {/* Notificaciones */}
              <Route path="/notificaciones" element={<NotificacionesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
