import type { DerrubaRegistro } from "./types";

export function processarDerruba(rows: any[]): DerrubaRegistro[] {
  return rows.map((row) => ({
    ut: row["UT"] ?? "",
    arvore: row["Nr. Árvore"] ?? "",
    especie: row["Espécie"] ?? "",
    nomeCientifico: row["Nome Científico"] ?? "",
    substituta: row["Substituta"] ?? "",
    data: row["Data do Corte"] ?? "",
    operador: row["Motoserrista Corte"] ?? "",
    quantidade: Number(row["QUANT."] ?? 0),
  }));
}