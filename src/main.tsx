import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { ExcelProvider } from "./context/ExcelContext";
import { FilterProvider } from "./context/FilterContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>

    <BrowserRouter>

      <ExcelProvider>

        <FilterProvider>

          <App />

        </FilterProvider>

      </ExcelProvider>

    </BrowserRouter>

  </StrictMode>
);