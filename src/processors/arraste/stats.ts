import type { ArrasteRegistro } from "./types";

export interface ArrasteStats {
  producaoTotal: number;
  operadores: number;
  dias: number;
  uts: number;
  arvores: number;
  especies: number;
}

export function calcularStatsArraste(
  registros: ArrasteRegistro[]
): ArrasteStats {
  const producaoTotal = registros.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  // Conta apenas os Skideiros
  const operadores = new Set(
    registros
      .map((r) => r.skideiro)
      .filter(Boolean)
  ).size;

  const dias = new Set(
    registros.map((r) => r.data).filter(Boolean)
  ).size;

  const uts = new Set(
    registros.map((r) => r.ut).filter(Boolean)
  ).size;

  const arvores = new Set(
    registros.map((r) => r.arvore).filter(Boolean)
  ).size;

  const especies = new Set(
    registros.map((r) => r.especie).filter(Boolean)
  ).size;

  return {
    producaoTotal,
    operadores,
    dias,
    uts,
    arvores,
    especies,
  };
}