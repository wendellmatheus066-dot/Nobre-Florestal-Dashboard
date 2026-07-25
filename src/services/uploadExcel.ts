import { supabase } from "../lib/supabase";

export async function salvarExcelNoSupabase(
  tabela: string,
  dados: any[]
) {

  // apaga os dados antigos
  const { error: deleteError } = await supabase
    .from(tabela)
    .delete()
    .neq("id", 0);


  if (deleteError) {
    console.error(
      "Erro ao limpar tabela:",
      deleteError
    );
  }


  // prepara os dados para JSONB
  const registros = dados.map((linha) => ({
    dados: linha,
  }));


  const { error } = await supabase
    .from(tabela)
    .insert(registros);


  if (error) {
    throw error;
  }

  console.log(
    `${tabela} enviado com sucesso`
  );
}