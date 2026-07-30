import { supabase } from "../lib/supabase";

export async function excluirUsuario(id: string) {
  const { data, error } = await supabase.functions.invoke(
    "excluir-usuario",
    {
      body: { id },
    }
  );

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    throw error;
  }

  if (!data?.sucesso) {
    throw new Error(data?.mensagem);
  }
}