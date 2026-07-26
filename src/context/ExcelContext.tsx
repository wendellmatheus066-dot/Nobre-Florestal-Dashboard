import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  buscarProducaoSupabase,
  buscarArrasteSupabase,
  buscarMedicaoSupabase,
} from "../services/supabaseExcel";

export type ExcelData = Record<string, any[]>;

type ExcelContextType = {
  data: ExcelData;
  setData: React.Dispatch<React.SetStateAction<ExcelData>>;
};

const ExcelContext = createContext<ExcelContextType | undefined>(
  undefined
);

export function ExcelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<ExcelData>({});

  useEffect(() => {
    async function carregarDados() {
      try {
        console.log("====================================");
        console.log("Iniciando carregamento do Supabase...");
        console.log("====================================");

        const producao = await buscarProducaoSupabase();
        console.log("PRODUÇÃO:", producao);
        console.log("Qtd Produção:", producao?.length);

        const arraste = await buscarArrasteSupabase();
        console.log("ARRASTE:", arraste);
        console.log("Qtd Arraste:", arraste?.length);

        const medicao = await buscarMedicaoSupabase();
        console.log("MEDIÇÃO:", medicao);
        console.log("Qtd Medição:", medicao?.length);

        setData({
          "PRODUÇÃO": producao,
          "ARRASTE": arraste,
          "MEDIÇÃO": medicao,
        });

        console.log("====================================");
        console.log("Dados carregados com sucesso!");
        console.log("====================================");
      } catch (error) {
        console.error("ERRO AO BUSCAR DADOS:", error);
      }
    }

    carregarDados();
  }, []);

  return (
    <ExcelContext.Provider
      value={{
        data,
        setData,
      }}
    >
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