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

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r: any) => {
      if (
        filtros.operador &&
        String(r[campoOperador] ?? "").trim() !== filtros.operador.trim()
      ) {
        return false;
      }

      if (
        filtros.ut &&
        String(r["UT"] ?? "").trim() !== filtros.ut.trim()
      ) {
        return false;
      }

      if (
        filtros.especie &&
        String(r["Espécie"] ?? "").trim() !== filtros.especie.trim()
      ) {
        return false;
      }

      return true;
    });
  }, [registros, filtros, campoOperador]);

  const operadores = useMemo(() => {
    const lista = registrosFiltrados
      .map((r: any) => r[campoOperador])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados, campoOperador]);

  const uts = useMemo(() => {
    const lista = registrosFiltrados
      .map((r: any) => r["UT"])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados]);

  const especies = useMemo(() => {
    const lista = registrosFiltrados
      .map((r: any) => r["Espécie"])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados]);

  return (
    <div className="mb-6 rounded-2xl border border-[#44475A] bg-[#343746] p-4 shadow-xl sm:p-5 lg:p-6">

      <div className="mb-5 flex items-start gap-3 sm:items-center">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/15 flex-shrink-0">
          <Search className="text-green-400" size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Filtros
          </h2>

          <p className="text-xs text-slate-400 sm:text-sm">
            Os dados são atualizados automaticamente.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* DATA */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
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
            h-11
            sm:h-12
            rounded-xl
            bg-[#282A36]
            border
            border-[#44475A]
            px-4
            text-sm
            text-white
            transition-all
            duration-200
            focus:outline-none
            focus:border-green-500
            focus:ring-2
            focus:ring-green-500/20
          "
        />
      </div>

      {/* OPERADOR */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
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
            h-11
            sm:h-12
            rounded-xl
            bg-[#282A36]
            border
            border-[#44475A]
            px-4
            text-sm
            text-white
            transition-all
            duration-200
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
        <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
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
            h-11
            sm:h-12
            rounded-xl
            bg-[#282A36]
            border
            border-[#44475A]
            px-4
            text-sm
            text-white
            transition-all
            duration-200
            focus:outline-none
            focus:border-green-500
            focus:ring-2
            focus:ring-green-500/20
          "
        >
          <option value="">
            Todas as UTs
          </option>

          {uts.map((ut) => (
            <option key={ut} value={ut}>
              {ut}
            </option>
          ))}
        </select>
      </div>
            {/* ESPÉCIE */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
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
            h-11
            sm:h-12
            rounded-xl
            bg-[#282A36]
            border
            border-[#44475A]
            px-4
            text-sm
            text-white
            transition-all
            duration-200
            focus:outline-none
            focus:border-green-500
            focus:ring-2
            focus:ring-green-500/20
          "
        >
          <option value="">
            Todas as Espécies
          </option>

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