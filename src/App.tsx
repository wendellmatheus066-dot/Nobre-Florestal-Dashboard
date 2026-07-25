import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Arraste from "./pages/Arraste";
import Medicao from "./pages/Medicao";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/arraste"
        element={<Arraste />}
      />

      <Route
        path="/medicao"
        element={<Medicao />}
      />

    </Routes>
  );
}

export default App;