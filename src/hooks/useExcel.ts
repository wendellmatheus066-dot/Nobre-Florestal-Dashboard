import { supabase } from "../lib/supabase";
import { readExcel } from "../services/excelService";
import { useExcelContext } from "../context/ExcelContext";
import { salvarExcelNoSupabase } from "../services/uploadExcel";

export function useExcel() {
  const { data, setData } = useExcelContext();

  async function loadExcel(file: File) {
    try {
      // Lê o Excel
      const result = await readExcel(file);

      // Atualiza tela local
      setData(result);

      // Envia Produção
      if (result["PRODUÇÃO"]) {
        await salvarExcelNoSupabase(
          "producao",
          result["PRODUÇÃO"]
        );
      }

      // Envia Arraste
      if (result["ARRASTE"]) {
        await salvarExcelNoSupabase(
          "arraste",
          result["ARRASTE"]
        );
      }

      // Envia Medição
      const medicao =
        result["MEDIÇÃO"] ??
        result["MEDICAO"] ??
        result["MEDIÇÃO ".trim()];

      if (medicao) {
        await salvarExcelNoSupabase(
          "medicao",
          medicao
        );
      }

      // Atualiza a data/hora da última importação
      const { data, error } = await supabase
        .from("configuracoes")
        .update({
          valor: new Date().toISOString(),
        })
        .eq("chave", "ultima_importacao")
        .select();

      console.log("Atualização configuracoes:", data);
      console.log("Erro configuracoes:", error);

      if (error) {
        console.error(
          "Erro ao atualizar data da importação:",
          error
        );
      }

      console.log("Excel salvo no Supabase!");

    } catch (error) {
      console.error(
        "Erro ao importar Excel:",
        error
      );
    }
  }

  return {
    data,
    loadExcel,
  };
}