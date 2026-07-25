import type { DerrubaRegistro } from "./types";

export interface DerrubaStats {
  totalArvores: number;
  operadoresAtivos: number;
  especies: number;
  uts: number;
}

export function calcularStatsDerruba(
  dados: DerrubaRegistro[]
): DerrubaStats {
  return {
    totalArvores: dados.length,

    operadoresAtivos: new Set(
      dados
        .map((item) => item.operador)
        .filter(Boolean)
    ).size,

    especies: new Set(
      dados
        .map((item) => item.especie)
        .filter(Boolean)
    ).size,

    uts: new Set(
      dados
        .map((item) => item.ut)
        .filter(Boolean)
    ).size,
  };
}