import * as XLSX from "xlsx";

function formatCell(value: any) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // Objeto Date
  if (value instanceof Date) {
    const dia = String(value.getDate()).padStart(2, "0");
    const mes = String(value.getMonth() + 1).padStart(2, "0");
    const ano = value.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  // Número serial do Excel
  if (typeof value === "number") {
    if (value > 30000 && value < 60000) {
      const data = XLSX.SSF.parse_date_code(value);

      if (data) {
        const dia = String(data.d).padStart(2, "0");
        const mes = String(data.m).padStart(2, "0");
        const ano = data.y;

        return `${dia}/${mes}/${ano}`;
      }
    }

    return String(value);
  }

  const texto = String(value).trim();

  // Formato americano: 7/30/26 ou 7/30/2026
  const usa = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (usa) {
    let mes = Number(usa[1]);
    let dia = Number(usa[2]);
    let ano = Number(usa[3]);

    if (ano < 100) {
      ano += 2000;
    }

    // Se o segundo número for maior que 12, é MM/DD
    if (dia > 12) {
      return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
    }

    // Se o primeiro número for maior que 12, já está DD/MM
    if (mes > 12) {
      return `${String(mes).padStart(2, "0")}/${String(dia).padStart(2, "0")}/${ano}`;
    }

    // Mantém DD/MM por padrão
    return `${String(mes).padStart(2, "0")}/${String(dia).padStart(2, "0")}/${ano}`;
  }

  return texto;
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
      raw: false,
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