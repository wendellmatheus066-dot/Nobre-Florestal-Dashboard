import { supabase } from "../lib/supabase";

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("nome", { ascending: true });

  console.log("USUÁRIOS:", data);
  console.log("ERRO:", error);

  if (error) {
    throw error;
  }

  return data ?? [];
}