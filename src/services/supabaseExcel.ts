import { supabase } from "../lib/supabase";

function limparNumero(valor: any) {
  if (valor === undefined || valor === null) {
    return "";
  }

  return String(valor)
    .replace(".0", "")
    .trim();
}

async function buscarTabelaSupabase(tabela: string) {
  const todos: any[] = [];
  const tamanho = 1000;
  let inicio = 0;

  try {
    while (true) {
      const { data, error } = await supabase
        .from(tabela)
        .select("*")
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

      console.log(`${tabela} página ${inicio}:`, data.length);

      if (data.length < tamanho) {
        break;
      }

      inicio += tamanho;
    }

    console.log(`${tabela} TOTAL:`, todos.length);

    return todos.map((item) => item.dados);
  } catch (error) {
    console.error(`Erro buscando ${tabela}:`, error);
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
    console.log("Buscando inventário...");

    const todos: any[] = [];
    const tamanho = 1000;
    let inicio = 0;

    while (true) {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
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
        `inventario página ${inicio}:`,
        data.length
      );

      if (data.length < tamanho) {
        break;
      }

      inicio += tamanho;
    }

    console.log(
      "TOTAL INVENTARIO BUSCADO:",
      todos.length
    );

    const numerosLimpos = numeros.map((numero) =>
      limparNumero(numero)
    );

    const filtrado = todos.filter((item) => {
      const dados = item.dados || {};

      const numeroInventario = limparNumero(
        dados["Nº ÁRVORE"]
      );

      return numerosLimpos.includes(numeroInventario);
    });

    console.log(
      "INVENTÁRIO ENCONTRADO:",
      filtrado.length
    );

    return filtrado.map((item) => item.dados);
  } catch (error) {
    console.error("Erro inventário:", error);
    return [];
  }
}

// ============================
// PRODUÇÃO
// ============================

export async function buscarProducaoSupabase() {
  return buscarTabelaSupabase("producao");
}

// ============================
// ARRASTE
// ============================

export async function buscarArrasteSupabase() {
  return buscarTabelaSupabase("arraste");
}

// ============================
// MEDIÇÃO
// ============================

export async function buscarMedicaoSupabase() {
  return buscarTabelaSupabase("medicao");
}

// ============================
// INVENTÁRIO
// ============================

export async function buscarInventarioSupabase(
  numeros: string[] = []
) {
  if (numeros.length > 0) {
    return buscarInventarioFiltrado(numeros);
  }

  return buscarTabelaSupabase("inventario");
}

// ============================
// ÚLTIMA IMPORTAÇÃO
// ============================

export async function buscarUltimaImportacao() {
  try {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("*");

    console.log("==========================================");
    console.log("CONFIGURAÇÕES RETORNADAS:");
    console.table(data);
    console.log("ERRO:", error);
    console.log("==========================================");

    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      console.warn(
        "A tabela 'configuracoes' retornou ZERO registros."
      );
      return null;
    }

    const registro = data.find(
      (item: any) =>
        item.chave === "ultima_importacao"
    );

    console.log(
      "REGISTRO ENCONTRADO:",
      registro
    );

    if (!registro) {
      console.warn(
        "Não existe uma linha com chave = 'ultima_importacao'."
      );
      return null;
    }

    return registro.valor;
  } catch (error) {
    console.error(
      "Erro inesperado:",
      error
    );
    return null;
  }
}