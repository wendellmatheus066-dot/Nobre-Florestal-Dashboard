import type { ArrasteRegistro } from "./types";

export function processarArraste(rows: any[]): ArrasteRegistro[] {
  return rows.map((row) => ({
    ut: row["UT"] ?? "",

    arvore: row["Nr. Árvore"] ?? "",

    especie: row["Espécie"] ?? "",

    data: row["Data Patio"] ?? "",

    ajudante: row["Ajudante Pátio"] ?? "",

    skideiro: row["Skideiro Patio"] ?? "",

    motivo: row["MOTIVO"] ?? "",

    quantidade: Number(
      String(row["qtd"] ?? 0)
        .replace(/\./g, "")
        .replace(",", ".")
    ),
  }));
}