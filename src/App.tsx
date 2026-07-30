import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Arraste from "./pages/Arraste";
import Medicao from "./pages/Medicao";
import MapaFlorestal from "./pages/MapaFlorestal";
import Login from "./pages/Login";

import Admin from "./pages/Admin";
import AdminUsuarios from "./pages/AdminUsuarios";
import NovoUsuario from "./pages/NovoUsuario";
import EditarUsuario from "./pages/EditarUsuario";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Página de Login */}
      <Route path="/login" element={<Login />} />

      {/* Página inicial */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Arraste */}
      <Route
        path="/arraste"
        element={
          <ProtectedRoute>
            <Arraste />
          </ProtectedRoute>
        }
      />

      {/* Medição */}
      <Route
        path="/medicao"
        element={
          <ProtectedRoute>
            <Medicao />
          </ProtectedRoute>
        }
      />

      {/* Mapa */}
      <Route
        path="/mapa"
        element={
          <ProtectedRoute>
            <MapaFlorestal />
          </ProtectedRoute>
        }
      />

      {/* Administração */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AdminUsuarios />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios/novo"
        element={
          <ProtectedRoute>
            <NovoUsuario />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios/:id"
        element={
          <ProtectedRoute>
            <EditarUsuario />
          </ProtectedRoute>
        }
      />

      {/* Qualquer rota inválida */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;