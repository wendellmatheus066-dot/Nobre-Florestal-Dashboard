import * as XLSX from "xlsx";

function formatCell(value: any) {
  if (!value) return "";

  // Caso venha como objeto Date
  if (value instanceof Date) {
    const dia = String(value.getDate()).padStart(2, "0");
    const mes = String(value.getMonth() + 1).padStart(2, "0");
    const ano = value.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  // Caso venha como número serial do Excel
  if (typeof value === "number") {
    if (value > 30000 && value < 60000) {
      const date = XLSX.SSF.parse_date_code(value);

      if (date) {
        const dia = String(date.d).padStart(2, "0");
        const mes = String(date.m).padStart(2, "0");
        const ano = date.y;

        return `${dia}/${mes}/${ano}`;
      }
    }
  }

  return String(value).trim();
}

export async function readExcel(file: File) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  const data: Record<string, any[]> = {};

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: true,
    });

    data[sheetName.toUpperCase()] = rows.map((row: any) => {
      const novo: Record<string, any> = {};

      Object.keys(row).forEach((key) => {
        novo[key] = formatCell(row[key]);
      });

      return novo;
    });
  });

  return data;
}