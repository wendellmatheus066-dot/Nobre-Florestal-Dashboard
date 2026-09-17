import { supabase } from "../lib/supabase";

// ============================
// ATUALIZA ÚLTIMA IMPORTAÇÃO
// ============================

async function atualizarUltimaImportacao() {
  const agora = new Date().toISOString();

  const { error } = await supabase
    .from("configuracoes2")
    .update({
      valor: agora,
    })
    .eq("chave", "ultima_importacao");

  if (error) {
    console.error(
      "Erro atualizando última importação:",
      error
    );

    throw error;
  }

  console.log(
    "Última importação atualizada:",
    agora
  );
}

// ============================
// LIMPAR INVENTÁRIO
// ============================

async function limparInventario() {
  console.log(
    "Limpando inventário diretamente no Supabase..."
  );

  const { error } = await supabase.rpc(
    "limpar_inventario"
  );

  if (error) {
    console.error(
      "Erro limpando inventário:",
      error
    );

    throw error;
  }

  console.log(
    "Inventário antigo removido com sucesso."
  );
}

// ============================
// LIMPAR TABELA NORMAL
// ============================

async function limparTabela(
  tabela: string
) {
  const { error } = await supabase
    .from(tabela)
    .delete()
    .neq("id", 0);

  if (error) {
    console.error(
      `Erro limpando ${tabela}:`,
      error
    );

    throw error;
  }

  console.log(
    `${tabela}: dados antigos apagados`
  );
}

// ============================
// SALVAR PLANILHA
// ============================

export async function salvarPlanilha(
  tabela: string,
  dados: any[]
) {
  try {
    console.log(
      "================================="
    );

    console.log(
      "IMPORTANDO TABELA:",
      tabela
    );

    console.log(
      "QUANTIDADE:",
      dados.length
    );

    console.log(
      "================================="
    );

    // ==========================================
    // LIMPEZA
    // ==========================================

    if (tabela === "inventario") {
      // Inventário é muito grande.
      // A limpeza é feita diretamente no banco.
      await limparInventario();
    } else {
      await limparTabela(tabela);
    }

    // ==========================================
    // NENHUM DADO
    // ==========================================

    if (
      !dados ||
      dados.length === 0
    ) {
      console.log(
        `${tabela}: nenhum dado para inserir`
      );

      return true;
    }

    // ==========================================
    // INSERÇÃO EM LOTES
    // ==========================================

    const tamanhoLote = 500;

    for (
      let i = 0;
      i < dados.length;
      i += tamanhoLote
    ) {
      const lote = dados
        .slice(
          i,
          i + tamanhoLote
        )
        .map((linha) => ({
          dados: linha,
        }));

      const { error } =
        await supabase
          .from(tabela)
          .insert(lote);

      if (error) {
        console.error(
          `Erro inserindo lote de ${tabela}:`,
          error
        );

        throw error;
      }

      console.log(
        `${tabela}: enviado ${Math.min(
          i + lote.length,
          dados.length
        )}/${dados.length}`
      );
    }

    // ==========================================
    // ÚLTIMA IMPORTAÇÃO
    // ==========================================

    if (
      tabela === "producao" ||
      tabela === "arraste" ||
      tabela === "medicao"
    ) {
      await atualizarUltimaImportacao();
    }

    console.log(
      "================================="
    );

    console.log(
      "IMPORTAÇÃO FINALIZADA:",
      tabela
    );

    console.log(
      "TOTAL:",
      dados.length
    );

    console.log(
      "================================="
    );

    return true;

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "ERRO NA IMPORTAÇÃO:",
      tabela
    );

    console.error(error);

    console.error(
      "================================="
    );

    throw error;
  }
}