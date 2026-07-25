import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { ExcelProvider } from "./context/ExcelContext";
import { FilterProvider } from "./context/FilterContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExcelProvider>
      <FilterProvider>
        <App />
      </FilterProvider>
    </ExcelProvider>
  </StrictMode>
);