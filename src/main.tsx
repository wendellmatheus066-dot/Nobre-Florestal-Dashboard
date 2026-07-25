import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { ExcelProvider } from "./context/ExcelContext";
import { FilterProvider } from "./context/FilterContext";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ExcelProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </ExcelProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);