
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Arraste from "./pages/Arraste";
import Medicao from "./pages/Medicao";
import MapaFlorestal from "./pages/MapaFlorestal";

import Admin from "./pages/Admin";
import AdminUsuarios from "./pages/AdminUsuarios";
import NovoUsuario from "./pages/NovoUsuario";
import EditarUsuario from "./pages/EditarUsuario";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/arraste" element={<Arraste />} />

      <Route path="/medicao" element={<Medicao />} />

      <Route path="/mapa" element={<MapaFlorestal />} />

      <Route path="/admin" element={<Admin />} />

      <Route
        path="/admin/usuarios"
        element={<AdminUsuarios />}
      />

      <Route
        path="/admin/usuarios/novo"
        element={<NovoUsuario />}
      />

      <Route
        path="/admin/usuarios/:id"
        element={<EditarUsuario />}
      />
    </Routes>
  );
}

export default App;