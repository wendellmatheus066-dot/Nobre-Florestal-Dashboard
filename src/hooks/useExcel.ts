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

      // Envia para Supabase
      if (result["PRODUÇÃO"]) {
        await salvarExcelNoSupabase(
          "producao",
          result["PRODUÇÃO"]
        );
      }

      if (result["ARRASTE"]) {
        await salvarExcelNoSupabase(
          "arraste",
          result["ARRASTE"]
        );
      }

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