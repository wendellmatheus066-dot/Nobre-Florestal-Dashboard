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
  setData: React.Dispatch<
    React.SetStateAction<ExcelData>
  >;
};


const ExcelContext =
  createContext<ExcelContextType | undefined>(
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

        const producao =
          await buscarProducaoSupabase();

        const arraste =
          await buscarArrasteSupabase();

        const medicao =
          await buscarMedicaoSupabase();


        setData({

          "PRODUÇÃO": producao,

          "ARRASTE": arraste,

          "MEDIÇÃO": medicao,

        });


        console.log(
          "Dados carregados do Supabase"
        );


      } catch (error) {

        console.error(
          "Erro buscando dados:",
          error
        );

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

  const context =
    useContext(ExcelContext);


  if (!context) {

    throw new Error(
      "useExcelContext deve ser usado dentro de ExcelProvider"
    );

  }


  return context;

}