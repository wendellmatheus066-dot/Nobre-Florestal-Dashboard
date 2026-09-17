import { supabase } from "../lib/supabase";

export async function salvarExcelNoSupabase(
  tabela: string,
  dados: any[]
) {
  console.log(
    `Preparando envio da tabela: ${tabela}`
  );

  // ==========================================
  // 1. APAGAR DADOS ANTIGOS
  // ==========================================

  const { error: deleteError } =
    await supabase
      .from(tabela)
      .delete()
      .not("id", "is", null);

  if (deleteError) {
    console.error(
      `Erro ao limpar tabela ${tabela}:`,
      deleteError
    );

    // IMPORTANTE:
    // Não continuar para o INSERT se o DELETE falhar.
    throw deleteError;
  }

  console.log(
    `${tabela}: dados antigos apagados`
  );

  // ==========================================
  // 2. PREPARAR DADOS
  // ==========================================

  const registros = dados.map(
    (linha) => ({
      dados: linha,
    })
  );

  // ==========================================
  // 3. INSERIR DADOS NOVOS
  // ==========================================

  if (registros.length === 0) {
    console.log(
      `${tabela}: nenhum registro para inserir`
    );

    return;
  }

  const { error: insertError } =
    await supabase
      .from(tabela)
      .insert(registros);

  if (insertError) {
    console.error(
      `Erro inserindo ${tabela}:`,
      insertError
    );

    throw insertError;
  }

  console.log(
    `${tabela} enviado com sucesso: ${registros.length} registros`
  );
}