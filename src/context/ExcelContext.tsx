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
  buscarJustificadasSupabase,
  buscarInventarioSupabase,
  buscarUltimaImportacao,
} from "../services/supabaseExcel";

export type ExcelData = Record<string, any[]>;

type ExcelContextType = {
  data: ExcelData;
  setData: React.Dispatch<
    React.SetStateAction<ExcelData>
  >;
  ultimaAtualizacao: Date | null;
};

const ExcelContext = createContext<
  ExcelContextType | undefined
>(undefined);

// ========================================
// LIMPAR NÚMERO DA ÁRVORE
// ========================================

function limparNumero(valor: any) {
  if (
    valor === undefined ||
    valor === null
  ) {
    return "";
  }

  return String(valor)
    .trim()
    .replace(/\.0$/, "");
}

// ========================================
// PEGAR NÚMERO DA ÁRVORE
// ACEITA OS CABEÇALHOS DOS DIFERENTES EXCELS
// ========================================

function pegarNumeroArvore(arvore: any) {
  if (!arvore) {
    return "";
  }

  const possiveisCampos = [
    "Nº ÁRVORE",
    "Nº ARVORE",
    "Nr. Árvore",
    "Nr. ARVORE",
    "NR. ÁRVORE",
    "NR. ARVORE",
    "Número da Árvore",
    "NUMERO DA ARVORE",
  ];

  for (const campo of possiveisCampos) {
    if (
      arvore[campo] !== undefined &&
      arvore[campo] !== null &&
      String(arvore[campo]).trim() !== ""
    ) {
      return limparNumero(
        arvore[campo]
      );
    }
  }

  return "";
}

export function ExcelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] =
    useState<ExcelData>({});

  const [
    ultimaAtualizacao,
    setUltimaAtualizacao,
  ] = useState<Date | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        console.log(
          "===================================="
        );

        console.log(
          "Carregando operação..."
        );

        console.log(
          "===================================="
        );

        const [
          producao,
          arraste,
          medicao,
          justificadas,
          ultimaImportacao,
        ] = await Promise.all([
          buscarProducaoSupabase(),
          buscarArrasteSupabase(),
          buscarMedicaoSupabase(),
          buscarJustificadasSupabase(),
          buscarUltimaImportacao(),
        ]);

        console.log(
          "RETORNO buscarUltimaImportacao():",
          ultimaImportacao
        );

        // ========================================
        // DADOS PRINCIPAIS
        // ========================================

        setData({
          "PRODUÇÃO": producao,
          "ARRASTE": arraste,
          "MEDIÇÃO": medicao,
          "JUSTIFICADAS": justificadas,
          "INVENTÁRIO": [],
        });

        if (ultimaImportacao) {
          setUltimaAtualizacao(
            new Date(ultimaImportacao)
          );
        }

        console.log(
          "Dashboard pronto!"
        );

        console.log(
          "Produção:",
          producao.length
        );

        console.log(
          "Arraste:",
          arraste.length
        );

        console.log(
          "Medição:",
          medicao.length
        );

        console.log(
          "Justificadas:",
          justificadas.length
        );

        console.log(
          "Última Importação:",
          ultimaImportacao
        );

        // ========================================
        // ÁRVORES PARA BUSCAR NO INVENTÁRIO
        // ========================================

        const numerosArvores = [
          ...producao,
          ...arraste,
          ...medicao,
          ...justificadas,
        ]
          .map((arvore: any) =>
            pegarNumeroArvore(arvore)
          )
          .filter(
            (numero) => numero !== ""
          );

        const numerosUnicos = [
          ...new Set(numerosArvores),
        ];

        // ========================================
        // DEBUG
        // ========================================

        console.log(
          "===================================="
        );

        console.log(
          "ÁRVORES PARA BUSCAR NO INVENTÁRIO:",
          numerosUnicos.length
        );

        console.log(
          "PRODUÇÃO:",
          producao.length
        );

        console.log(
          "ARRASTE:",
          arraste.length
        );

        console.log(
          "MEDIÇÃO:",
          medicao.length
        );

        console.log(
          "JUSTIFICADAS:",
          justificadas.length
        );

        console.log(
          "===================================="
        );

        // Conferir algumas justificadas

        const numerosJustificadas =
          justificadas
            .map((arvore: any) =>
              pegarNumeroArvore(arvore)
            )
            .filter(
              (numero) => numero !== ""
            );

        console.log(
          "NÚMEROS DAS JUSTIFICADAS:",
          numerosJustificadas.slice(
            0,
            20
          )
        );

        console.log(
          "TOTAL NÚMEROS JUSTIFICADAS:",
          numerosJustificadas.length
        );

        console.log(
          "Buscando inventário filtrado..."
        );

        // ========================================
        // BUSCAR INVENTÁRIO
        // ========================================

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

        // ========================================
        // ATUALIZA INVENTÁRIO
        // ========================================

        setData(
          (estadoAtual) => ({
            ...estadoAtual,
            "INVENTÁRIO":
              inventario,
          })
        );

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
  const context =
    useContext(ExcelContext);

  if (!context) {
    throw new Error(
      "useExcelContext deve ser usado dentro do ExcelProvider"
    );
  }

  return context;
}