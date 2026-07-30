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
  buscarInventarioSupabase,
} from "../services/supabaseExcel";

export type ExcelData = Record<string, any[]>;

type ExcelContextType = {
  data: ExcelData;
  setData: React.Dispatch<React.SetStateAction<ExcelData>>;

  // NOVO
  ultimaAtualizacao: Date | null;
};

const ExcelContext = createContext<
  ExcelContextType | undefined
>(undefined);

function limparNumero(valor: any) {
  if (valor === undefined || valor === null) {
    return "";
  }

  return String(valor)
    .replace(".0", "")
    .trim();
}

export function ExcelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] =
    useState<ExcelData>({});

  // NOVO
  const [ultimaAtualizacao, setUltimaAtualizacao] =
    useState<Date | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        console.log("====================================");
        console.log("Carregando operação...");
        console.log("====================================");

        const [
          producao,
          arraste,
          medicao,
        ] = await Promise.all([
          buscarProducaoSupabase(),
          buscarArrasteSupabase(),
          buscarMedicaoSupabase(),
        ]);

        setData({
          "PRODUÇÃO": producao,
          "ARRASTE": arraste,
          "MEDIÇÃO": medicao,
          "INVENTÁRIO": [],
        });

        // NOVO
        setUltimaAtualizacao(new Date());

        console.log("Dashboard pronto!");
        console.log("Produção:", producao.length);
        console.log("Arraste:", arraste.length);
        console.log("Medição:", medicao.length);

        const numerosArvores = [
          ...producao,
          ...arraste,
          ...medicao,
        ]
          .map((arvore: any) =>
            limparNumero(arvore["Nº ÁRVORE"])
          )
          .filter((numero) => numero !== "");

        const numerosUnicos = [
          ...new Set(numerosArvores),
        ];

        console.log(
          "Árvores para buscar:",
          numerosUnicos.length
        );

        console.log(
          "Buscando inventário filtrado..."
        );

        const inventario =
          await buscarInventarioSupabase(
            numerosUnicos
          );

        console.log(
          "TESTE INVENTÁRIO RETORNADO:",
          inventario.length
        );

        console.log(
          "PRIMEIRA ÁRVORE:",
          inventario[0]
        );

        setData((estadoAtual) => ({
          ...estadoAtual,
          "INVENTÁRIO": inventario,
        }));
                console.log(
          "Inventário carregado!"
        );

        console.log(
          "Qtd Inventário:",
          inventario.length
        );

        console.log(
          "===================================="
        );

        console.log(
          "Todos dados carregados!"
        );

        console.log(
          "===================================="
        );
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR DADOS:",
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
        ultimaAtualizacao,
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
      "useExcelContext deve ser usado dentro do ExcelProvider"
    );
  }

  return context;
}