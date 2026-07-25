import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface DashboardFilters {
  operador: string;
  ut: string;
  especie: string;
  equipe: string;
  data: string;
}

export type DashboardTipo =
  | "derruba"
  | "arraste"
  | "medicao";

type TodosOsFiltros = {
  derruba: DashboardFilters;
  arraste: DashboardFilters;
  medicao: DashboardFilters;
};

type FilterContextType = {
  filters: TodosOsFiltros;

  setFilters: (
    tipo: DashboardTipo,
    filters: DashboardFilters
  ) => void;
};

const filtrosVazios: DashboardFilters = {
  operador: "",
  ut: "",
  especie: "",
  equipe: "",
  data: "",
};

const FilterContext = createContext<FilterContextType | undefined>(
  undefined
);

export function FilterProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [filters, setAllFilters] =
    useState<TodosOsFiltros>({
      derruba: { ...filtrosVazios },
      arraste: { ...filtrosVazios },
      medicao: { ...filtrosVazios },
    });

  function setFilters(
    tipo: DashboardTipo,
    novos: DashboardFilters
  ) {
    setAllFilters((old) => ({
      ...old,
      [tipo]: novos,
    }));
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error(
      "useFilters deve estar dentro do FilterProvider"
    );
  }

  return context;
}