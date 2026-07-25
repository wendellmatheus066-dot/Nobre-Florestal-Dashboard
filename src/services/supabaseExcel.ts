import { supabase } from "../lib/supabase";

export async function buscarProducaoSupabase() {
  const { data, error } = await supabase
    .from("producao")
    .select("*");

  if (error) {
    throw error;
  }

  return data.map((item) => item.dados);
}


export async function buscarArrasteSupabase() {
  const { data, error } = await supabase
    .from("arraste")
    .select("*");

  if (error) {
    throw error;
  }

  return data.map((item) => item.dados);
}


export async function buscarMedicaoSupabase() {
  const { data, error } = await supabase
    .from("medicao")
    .select("*");

  if (error) {
    throw error;
  }

  return data.map((item) => item.dados);
}