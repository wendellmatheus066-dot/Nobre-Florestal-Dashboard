import { supabase } from "../lib/supabase";

export async function buscarProducaoSupabase() {
  const todos: any[] = [];
  const tamanho = 1000;
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("producao")
      .select("*")
      .range(inicio, inicio + tamanho - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    todos.push(...data);

    if (data.length < tamanho) {
      break;
    }

    inicio += tamanho;
  }

  console.log("Produção recebida:", todos.length);

  return todos.map((item: any) => item.dados);
}

export async function buscarArrasteSupabase() {
  const todos: any[] = [];
  const tamanho = 1000;
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("arraste")
      .select("*")
      .range(inicio, inicio + tamanho - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    todos.push(...data);

    if (data.length < tamanho) {
      break;
    }

    inicio += tamanho;
  }

  console.log("Arraste recebido:", todos.length);

  return todos.map((item: any) => item.dados);
}

export async function buscarMedicaoSupabase() {
  const todos: any[] = [];
  const tamanho = 1000;
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("medicao")
      .select("*")
      .range(inicio, inicio + tamanho - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    todos.push(...data);

    if (data.length < tamanho) {
      break;
    }

    inicio += tamanho;
  }

  console.log("Medição recebida:", todos.length);

  return todos.map((item: any) => item.dados);
}