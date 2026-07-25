import { supabase } from "../lib/supabase";


export async function salvarPlanilha(
  tabela: string,
  dados: any[]
) {

  // limpa dados antigos
  const { error: deleteError } = await supabase
    .from(tabela)
    .delete()
    .neq("id", 0);


  if (deleteError) {
    console.log(deleteError);
  }


  const registros = dados.map((linha) => ({
    dados: linha,
  }));


  const { error } = await supabase
    .from(tabela)
    .insert(registros);


  if (error) {
    throw error;
  }

}