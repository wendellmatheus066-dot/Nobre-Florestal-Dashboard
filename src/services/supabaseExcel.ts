import { supabase } from "../lib/supabase";

// ============================
// LIMPAR NÚMERO
// ============================

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

// ============================
// BUSCAR TABELA COMPLETA
// ============================

async function buscarTabelaSupabase(
  tabela: string
) {
  const todos: any[] = [];

  const tamanho = 1000;
  let inicio = 0;

  try {
    while (true) {
      const { data, error } =
        await supabase
          .from(tabela)
          .select("dados")
          .order("id", {
            ascending: true,
          })
          .range(
            inicio,
            inicio + tamanho - 1
          );

      if (error) {
        throw error;
      }

      if (
        !data ||
        data.length === 0
      ) {
        break;
      }

      todos.push(...data);

      console.log(
        `${tabela} página ${inicio}:`,
        data.length
      );

      if (
        data.length < tamanho
      ) {
        break;
      }

      inicio += tamanho;
    }

    console.log(
      `${tabela} TOTAL:`,
      todos.length
    );

    return todos.map(
      (item) => item.dados
    );

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

    // ============================
    // LOTES DE 500
    // ============================

    const tamanhoLote = 500;

    for (
      let inicio = 0;
      inicio < numerosLimpos.length;
      inicio += tamanhoLote
    ) {
      const lote =
        numerosLimpos.slice(
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
//
// IMPORTANTE:
//
// O inventário completo contém:
// - Explorar
// - Explorar_CAP
// - Substituta
//
// Todas continuam armazenadas.
//
// Quando forem usados filtros por número
// de árvore, buscamos somente os números
// necessários.
//

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
// META DA DERRUBA
// ============================
//
// REGRA:
//
// SOMENTE "Explorar" entra na META.
//
// NÃO entram na meta:
// - Explorar_CAP
// - Substituta
//
// Essas duas categorias continuam
// disponíveis no inventário como
// árvores substitutas.
//

export async function contarInventarioExplorar() {
  try {
    console.log(
      "================================="
    );

    console.log(
      "BUSCANDO META DO DERRUBA"
    );

    console.log(
      "Categoria da META: Explorar"
    );

    console.log(
      "Explorar_CAP: NÃO entra"
    );

    console.log(
      "Substituta: NÃO entra"
    );

    console.log(
      "================================="
    );

    const { count, error } =
      await supabase
        .from("inventario")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "dados->>CATEGORIA",
          "Explorar"
        );

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    console.log(
      "================================="
    );

    console.log(
      "META DERRUBA — SOMENTE EXPLORAR:",
      total
    );

    console.log(
      "================================="
    );

    return total;

  } catch (error) {
    console.error(
      "Erro contando inventário Explorar:",
      error
    );

    return 0;
  }
}

// ============================
// CONTAR SUBSTITUTAS
// ============================
//
// Apenas para uso futuro no sistema.
//
// NÃO altera a META.
//

export async function contarInventarioSubstitutas() {
  try {
    const { count, error } =
      await supabase
        .from("inventario")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in(
          "dados->>CATEGORIA",
          [
            "Explorar_CAP",
            "Substituta",
          ]
        );

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    console.log(
      "SUBSTITUTAS DISPONÍVEIS:",
      total
    );

    return total;

  } catch (error) {
    console.error(
      "Erro contando substitutas:",
      error
    );

    return 0;
  }
}

// ============================
// ÚLTIMA IMPORTAÇÃO
// ============================

export async function buscarUltimaImportacao() {
  try {
    const { data, error } =
      await supabase
        .from("configuracoes2")
        .select(
          "chave, valor"
        );

    if (error) {
      console.error(
        "Erro buscando última importação:",
        error
      );

      return null;
    }

    if (
      !data ||
      data.length === 0
    ) {
      return null;
    }

    const registro =
      data.find(
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