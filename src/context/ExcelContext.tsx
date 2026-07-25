import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ExcelData = Record<string, any[]>;

type ExcelContextType = {
  data: ExcelData;
  setData: React.Dispatch<React.SetStateAction<ExcelData>>;
};

const ExcelContext = createContext<ExcelContextType | undefined>(undefined);

export function ExcelProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ExcelData>(() => {
    const saved = localStorage.getItem("excelData");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }

    return {};
  });

  useEffect(() => {
    localStorage.setItem("excelData", JSON.stringify(data));
  }, [data]);

  return (
    <ExcelContext.Provider value={{ data, setData }}>
      {children}
    </ExcelContext.Provider>
  );
}

export function useExcelContext() {
  const context = useContext(ExcelContext);

  if (!context) {
    throw new Error(
      "useExcelContext deve ser usado dentro de ExcelProvider"
    );
  }

  return context;
}