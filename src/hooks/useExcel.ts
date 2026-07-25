import { readExcel } from "../services/excelService";
import { useExcelContext } from "../context/ExcelContext";

export function useExcel() {
  const { data, setData } = useExcelContext();

  async function loadExcel(file: File) {
    const result = await readExcel(file);
    setData(result);
  }

  return {
    data,
    loadExcel,
  };
}