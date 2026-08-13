import { supabase } from "../lib/supabase";

function limparNumero(valor: any) {
  if (valor === undefined || valor === null) {
    return "";
  }

  return String(valor)
    .trim()
    .replace(/\.0$/, "");
}

// ============================
// BUSCAR TABELA COMPLETA
// ============================

async function buscarTabelaSupabase(tabela: string) {
  const todos: any[] = [];
  const tamanho = 1000;
  let inicio = 0;

  try {
    while (true) {
      const { data, error } = await supabase
        .from(tabela)
        .select("dados")
        .order("id", {
          ascending: true,
        })
        .range(inicio, inicio + tamanho - 1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      todos.push(...data);

      console.log(
        `${tabela} página ${inicio}:`,
        data.length
      );

      if (data.length < tamanho) {
        break;
      }

      inicio += tamanho;
    }

    console.log(
      `${tabela} TOTAL:`,
      todos.length
    );

    return todos.map((item) => item.dados);
  } catch (error) {
    console.error(
      `Erro buscando ${tabela}:`,
      error
    );

    return [];
  }
}

// ============================
// INVENTÁRIO FILTRADO
// ============================

async function buscarInventarioFiltrado(
  numeros: string[]
) {
  if (numeros.length === 0) {
    return [];
  }

  try {
    console.log(
      "Buscando inventário filtrado..."
    );

    // Remove duplicados e limpa os números
    const numerosLimpos = [
      ...new Set(
        numeros
          .map((numero) =>
            limparNumero(numero)
          )
          .filter(Boolean)
      ),
    ];

    console.log(
      "Árvores para buscar:",
      numerosLimpos.length
    );

    const resultados: any[] = [];

    // ==================================================
    // Fazemos em lotes para não estourar a URL da consulta
    // ==================================================

    const tamanhoLote = 500;

    for (
      let inicio = 0;
      inicio < numerosLimpos.length;
      inicio += tamanhoLote
    ) {
      const lote = numerosLimpos.slice(
        inicio,
        inicio + tamanhoLote
      );

      console.log(
        `Buscando lote ${inicio} - ${
          inicio + lote.length
        }`
      );

      const { data, error } =
        await supabase
          .from("inventario")
          .select("dados")
          .filter(
            "dados->>Nº ÁRVORE",
            "in",
            `(${lote
              .map(
                (numero) =>
                  `"${numero.replace(
                    /"/g,
                    '\\"'
                  )}"`
              )
              .join(",")})`
          );

      if (error) {
        throw error;
      }

      if (data) {
        resultados.push(...data);
      }

      console.log(
        `Resultado do lote: ${
          data?.length ?? 0
        }`
      );
    }

    console.log(
      "INVENTÁRIO ENCONTRADO:",
      resultados.length
    );

    return resultados.map(
      (item) => item.dados
    );
  } catch (error) {
    console.error(
      "Erro inventário:",
      error
    );

    return [];
  }
}

// ============================
// PRODUÇÃO
// ============================

export async function buscarProducaoSupabase() {
  return buscarTabelaSupabase(
    "producao"
  );
}

// ============================
// ARRASTE
// ============================

export async function buscarArrasteSupabase() {
  return buscarTabelaSupabase(
    "arraste"
  );
}

// ============================
// MEDIÇÃO
// ============================

export async function buscarMedicaoSupabase() {
  return buscarTabelaSupabase(
    "medicao"
  );
}

// ============================
// JUSTIFICADAS
// ============================

export async function buscarJustificadasSupabase() {
  return buscarTabelaSupabase(
    "justificadas"
  );
}

// ============================
// INVENTÁRIO
// ============================

export async function buscarInventarioSupabase(
  numeros: string[] = []
) {
  if (numeros.length > 0) {
    return buscarInventarioFiltrado(
      numeros
    );
  }

  return buscarTabelaSupabase(
    "inventario"
  );
}

// ============================
// ÚLTIMA IMPORTAÇÃO
// ============================

export async function buscarUltimaImportacao() {
  try {
    const { data, error } =
      await supabase
        .from("configuracoes2")
        .select("chave, valor");

    if (error) {
      console.error(
        "Erro buscando última importação:",
        error
      );

      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const registro = data.find(
      (item: any) =>
        item.chave ===
        "ultima_importacao"
    );

    return (
      registro?.valor ?? null
    );
  } catch (error) {
    console.error(
      "Erro inesperado:",
      error
    );

    return null;
  }
}