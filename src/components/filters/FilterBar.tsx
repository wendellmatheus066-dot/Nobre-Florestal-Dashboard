import { useMemo } from "react";
import { Search, Calendar, Users, Trees, Leaf } from "lucide-react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";

interface FilterBarProps {
  tipo: "derruba" | "arraste" | "medicao";
}

export default function FilterBar({ tipo }: FilterBarProps) {
  const { data } = useExcel();
  const { filters, setFilters } = useFilters();

  const filtros = filters[tipo];

  // Seleciona automaticamente a planilha correta
  const registros = useMemo(() => {
    switch (tipo) {
      case "arraste":
        return data["ARRASTE"] ?? [];

      case "medicao":
        return data["MEDIÇÃO"] ?? data["MEDICAO"] ?? [];

      default:
        return data["PRODUÇÃO"] ?? data["PRODUCAO"] ?? [];
    }
  }, [data, tipo]);

  // Campo do operador
  const campoOperador = useMemo(() => {
    switch (tipo) {
      case "arraste":
        return "Skideiro Patio";

      case "medicao":
        return "Medidor";

      default:
        return "Motoserrista Corte";
    }
  }, [tipo]);

  // Nome exibido no filtro
  const tituloOperador = useMemo(() => {
    switch (tipo) {
      case "arraste":
        return "Skideiro";

      case "medicao":
        return "Medidor";

      default:
        return "Motosserrista";
    }
  }, [tipo]);

  const operadores = useMemo(() => {
    const lista = registros
      .map((r: any) => r[campoOperador])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registros, campoOperador]);

  const uts = useMemo(() => {
    const lista = registros
      .map((r: any) => r["UT"])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registros]);

  const especies = useMemo(() => {
    const lista = registros
      .map((r: any) => r["Espécie"])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registros]);

  return (
    <div className="rounded-2xl border border-[#44475A] bg-[#343746] shadow-xl p-6 mb-30">

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/15">
          <Search className="text-green-400" size={20} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Filtros
          </h2>

          <p className="text-sm text-slate-400">
            Os dados são atualizados automaticamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* DATA */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Calendar size={16} />
            Data
          </label>

          <input
            type="date"
            value={filtros.data}
            onChange={(e) =>
              setFilters(tipo, {
                ...filtros,
                data: e.target.value,
              })
            }
            className="
              w-full
              h-12
              rounded-xl
              bg-[#282A36]
              border
              border-[#44475A]
              px-4
              text-white
              focus:outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
            "
          />
        </div>

        {/* OPERADOR */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Users size={16} />
            {tituloOperador}
          </label>

          <select
            value={filtros.operador}
            onChange={(e) =>
              setFilters(tipo, {
                ...filtros,
                operador: e.target.value,
              })
            }
            className="
              w-full
              h-12
              rounded-xl
              bg-[#282A36]
              border
              border-[#44475A]
              px-4
              text-white
              focus:outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
            "
          >
            <option value="">
              {`Todos os ${tituloOperador}s`}
            </option>

            {operadores.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
                {/* UT */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Trees size={16} />
            UT
          </label>

          <select
            value={filtros.ut}
            onChange={(e) =>
              setFilters(tipo, {
                ...filtros,
                ut: e.target.value,
              })
            }
            className="
              w-full
              h-12
              rounded-xl
              bg-[#282A36]
              border
              border-[#44475A]
              px-4
              text-white
              focus:outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
            "
          >
            <option value="">Todas as UTs</option>

            {uts.map((ut) => (
              <option key={ut} value={ut}>
                {ut}
              </option>
            ))}
          </select>
        </div>

        {/* ESPÉCIE */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Leaf size={16} />
            Espécie
          </label>

          <select
            value={filtros.especie}
            onChange={(e) =>
              setFilters(tipo, {
                ...filtros,
                especie: e.target.value,
              })
            }
            className="
              w-full
              h-12
              rounded-xl
              bg-[#282A36]
              border
              border-[#44475A]
              px-4
              text-white
              focus:outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
            "
          >
            <option value="">Todas as Espécies</option>

            {especies.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}