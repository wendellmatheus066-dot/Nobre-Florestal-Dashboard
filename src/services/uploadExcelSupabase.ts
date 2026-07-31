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
// SALVAR PLANILHA
// ============================

export async function salvarPlanilha(
  tabela: string,
  dados: any[]
) {
  try {
    console.log(
      "Importando tabela:",
      tabela
    );

    console.log(
      "Quantidade:",
      dados.length
    );

    // INVENTÁRIO é muito grande
    // não tenta apagar tudo
    if (tabela !== "inventario") {
      const { error: deleteError } =
        await supabase
          .from(tabela)
          .delete()
          .neq("id", 0);

      if (deleteError) {
        console.error(
          "Erro limpando tabela:",
          deleteError
        );

        throw deleteError;
      }
    } else {
      console.log(
        "Inventário: mantendo dados existentes para evitar timeout"
      );
    }

    const tamanhoLote = 100;

    for (
      let i = 0;
      i < dados.length;
      i += tamanhoLote
    ) {
      const lote = dados
        .slice(i, i + tamanhoLote)
        .map((linha) => ({
          dados: linha,
        }));

      const { error } =
        await supabase
          .from(tabela)
          .insert(lote);

      if (error) {
        console.error(
          "Erro inserindo lote:",
          error
        );

        throw error;
      }

      console.log(
        `${tabela}: enviado ${i + lote.length}/${dados.length}`
      );

      // pequena pausa
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );
    }

    // ============================
    // Atualiza somente quando for
    // Produção / Arraste / Medição
    // ============================

    if (
      tabela === "producao" ||
      tabela === "arraste" ||
      tabela === "medicao"
    ) {
      await atualizarUltimaImportacao();
    }

    console.log(
      "IMPORTAÇÃO FINALIZADA:",
      tabela
    );

    return true;
  } catch (error) {
    console.error(
      "ERRO IMPORTAÇÃO:",
      error
    );

    throw error;
  }
}