import { useMemo } from "react";
import {
  Search,
  Calendar,
  Users,
  Trees,
  Leaf,
  Trash2,
} from "lucide-react";

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
        return "Equipe";

      default:
        return "Motoserrista Corte";
    }
  }, [tipo]);

  const tituloOperador = useMemo(() => {
    switch (tipo) {
      case "arraste":
        return "Skideiro";

      case "medicao":
        return "Equipe";

      default:
        return "Motosserrista";
    }
  }, [tipo]);

  const registrosFiltrados = useMemo(() => {
    const campoUT =
      tipo === "medicao"
        ? "UT Inventário"
        : "UT";

    return registros.filter((r: any) => {
      if (
        filtros.operador &&
        String(r[campoOperador] ?? "").trim() !== filtros.operador.trim()
      )
        return false;

      if (
        filtros.ut &&
        String(r[campoUT] ?? "").trim() !== filtros.ut.trim()
      )
        return false;

      if (
        filtros.especie &&
        String(r["Espécie"] ?? "").trim() !== filtros.especie.trim()
      )
        return false;

      if (filtros.data) {
        const dataRegistro = String(r["Data"] ?? "").substring(0, 10);

        if (dataRegistro !== filtros.data) return false;
      }

      return true;
    });
  }, [registros, filtros, campoOperador, tipo]);
    const operadores = useMemo(() => {
    const lista = registrosFiltrados
      .map((r: any) => r[campoOperador])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados, campoOperador]);

  const uts = useMemo(() => {
    const campoUT =
      tipo === "medicao"
        ? "UT Inventário"
        : "UT";

    const lista = registrosFiltrados
      .map((r: any) => r[campoUT])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados, tipo]);

  const especies = useMemo(() => {
    const lista = registrosFiltrados
      .map((r: any) => r["Espécie"])
      .filter(Boolean);

    return [...new Set(lista)].sort();
  }, [registrosFiltrados]);

  return (
    <div className="mb-8 rounded-2xl border border-[#44475A] bg-[#343746] p-6 shadow-xl">

      <div className="mb-5 flex items-center justify-between pr-2">

        <div className="flex items-center gap-3">
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

        <button
          type="button"
          title="Limpar filtros"
          onClick={() =>
            setFilters(tipo, {
              operador: "",
              ut: "",
              especie: "",
              equipe: "",
              data: "",
            })
          }
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[#44475A] bg-[#282A36] text-slate-400 transition-all hover:border-green-500 hover:text-green-400"
        >
          <Trash2 size={17} />
        </button>

      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {/* DATA */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
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
            className="h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        {/* OPERADOR / EQUIPE */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
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
            className="h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">
              {tipo === "medicao"
                ? "Todas as Equipes"
                : `Todos os ${tituloOperador}s`}
            </option>

            {operadores.map((op: any) => (
              <option key={String(op)} value={String(op)}>
                {String(op)}
              </option>
            ))}
          </select>
        </div>

        {/* UT */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
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
            className="h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">Todas as UTs</option>

            {uts.map((ut: any) => (
              <option key={String(ut)} value={String(ut)}>
                {String(ut)}
              </option>
            ))}
          </select>
        </div>
                {/* ESPÉCIE */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
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
            className="h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">Todas as Espécies</option>

            {especies.map((esp: any) => (
              <option key={String(esp)} value={String(esp)}>
                {String(esp)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}