import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Filter,
  Search,
  MapPinned,
  Leaf,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Container from "../components/layout/Container";
import Header from "../components/layout/Header";
import { useExcel } from "../hooks/useExcel";

type LinhaJustificada = Record<string, any>;

function normalizarTexto(valor: any): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function valor(linha: LinhaJustificada, chaves: string[]) {
  for (const chave of chaves) {
    const v = linha?.[chave];

    if (
      v !== undefined &&
      v !== null &&
      String(v).trim() !== ""
    ) {
      return v;
    }
  }

  return "";
}

function texto(linha: LinhaJustificada, chaves: string[]): string {
  return String(valor(linha, chaves) ?? "").trim();
}

function rotulo(
  linha: LinhaJustificada,
  chaves: string[],
  fallback = "—"
) {
  const v = texto(linha, chaves);
  return v || fallback;
}

function numero(valorAtual: any): number {
  if (
    valorAtual === undefined ||
    valorAtual === null ||
    valorAtual === ""
  ) {
    return 0;
  }

  if (typeof valorAtual === "number") {
    return Number.isFinite(valorAtual) ? valorAtual : 0;
  }

  let textoNumero = String(valorAtual)
    .trim()
    .replace(/\s/g, "");

  if (
    textoNumero.includes(".") &&
    textoNumero.includes(",")
  ) {
    textoNumero = textoNumero
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (textoNumero.includes(",")) {
    textoNumero = textoNumero.replace(",", ".");
  }

  const n = Number(textoNumero);

  return Number.isFinite(n) ? n : 0;
}

export default function Justificadas() {
  const { data } = useExcel();

  const [busca, setBusca] = useState("");
  const [filtroUT, setFiltroUT] = useState("TODAS");
  const [filtroEspecie, setFiltroEspecie] = useState("TODAS");
  const [filtroMotivo, setFiltroMotivo] = useState("TODOS");

  const dados: LinhaJustificada[] =
    data["JUSTIFICADAS"] ?? [];

  const registros = useMemo(() => {
    return dados.map((linha, index) => ({
      original: linha,
      id: `${index}-${texto(linha, [
        "Nº ÁRVORE",
        "Nº Árvore",
        "Nr. Árvore",
        "Nr. Arvore",
      ])}`,
      ut: rotulo(linha, [
        "UT",
        "Nº UT",
        "Nº UT ",
        "UT Inventário",
        "UT INVENTÁRIO",
      ]),
      arvore: rotulo(linha, [
        "Nº ÁRVORE",
        "Nº Árvore",
        "Nr. Árvore",
        "Nr. Arvore",
        "Nº ARVORE",
      ]),
      especie: rotulo(linha, [
        "Espécie",
        "ESPÉCIE",
        "ESPECIE",
        "Nome Comum",
        "NOME COMUM",
      ]),
      motivo: rotulo(linha, [
        "MOTIVO",
        "Motivo",
        "MOTIVO JUSTIFICATIVA",
        "Motivo Justificativa",
        "JUSTIFICATIVA",
        "Justificativa",
      ]),
      data: rotulo(linha, [
        "Data",
        "DATA",
        "Data da Justificativa",
        "DATA JUSTIFICATIVA",
      ]),
      volume: numero(
        valor(linha, [
          "Volume M3",
          "Volume M³",
          "Florestal M3",
          "Florestal M³",
          "Comercial M3",
          "Comercial M³",
          "M3",
        ])
      ),
      observacao: rotulo(linha, [
        "Observação",
        "OBSERVAÇÃO",
        "OBSERVACAO",
        "Observacao",
      ]),
    }));
  }, [dados]);

  const uts = useMemo(
    () =>
      Array.from(
        new Set(
          registros
            .map((item) => item.ut)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [registros]
  );

  const especies = useMemo(
    () =>
      Array.from(
        new Set(
          registros
            .map((item) => item.especie)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [registros]
  );

  const motivos = useMemo(
    () =>
      Array.from(
        new Set(
          registros
            .map((item) => item.motivo)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [registros]
  );

  const filtrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return registros.filter((r) => {
      const passaUT =
        filtroUT === "TODAS" || r.ut === filtroUT;

      const passaEspecie =
        filtroEspecie === "TODAS" ||
        r.especie === filtroEspecie;

      const passaMotivo =
        filtroMotivo === "TODOS" ||
        r.motivo === filtroMotivo;

      const textoBusca = normalizarTexto(
        [
          r.ut,
          r.arvore,
          r.especie,
          r.motivo,
          r.data,
          r.observacao,
        ].join(" ")
      );

      const passaBusca =
        !termo || textoBusca.includes(termo);

      return (
        passaUT &&
        passaEspecie &&
        passaMotivo &&
        passaBusca
      );
    });
  }, [
    registros,
    filtroUT,
    filtroEspecie,
    filtroMotivo,
    busca,
  ]);

  const total = filtrados.length;
  const totalUTs = new Set(
    filtrados.map((item) => item.ut).filter(Boolean)
  ).size;
  const totalEspecies = new Set(
    filtrados.map((item) => item.especie).filter(Boolean)
  ).size;
  const rankingMotivos = useMemo(() => {
    const mapa = new Map<string, number>();

    filtrados.forEach((item) => {
      mapa.set(
        item.motivo,
        (mapa.get(item.motivo) ?? 0) + 1
      );
    });

    return Array.from(mapa.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  }, [filtrados]);

  const rankingEspecies = useMemo(() => {
    const mapa = new Map<string, number>();

    filtrados.forEach((item) => {
      mapa.set(
        item.especie,
        (mapa.get(item.especie) ?? 0) + 1
      );
    });

    return Array.from(mapa.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  }, [filtrados]);

  const maxMotivo =
    rankingMotivos[0]?.quantidade ?? 1;
  const maxEspecie =
    rankingEspecies[0]?.quantidade ?? 1;

  const principalMotivo =
    rankingMotivos[0]?.nome ?? "—";

  const principalEspecie =
    rankingEspecies[0]?.nome ?? "—";

  function limparFiltros() {
    setBusca("");
    setFiltroUT("TODAS");
    setFiltroEspecie("TODAS");
    setFiltroMotivo("TODOS");
  }

  return (
    <MainLayout>
      <style>{`
        @property --just-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes justRgbRun {
          to {
            --just-angle: 360deg;
          }
        }

        .just-rgb {
          border: 1px solid transparent;
          background:
            linear-gradient(#0c1715, #0c1715) padding-box,
            conic-gradient(
              from var(--just-angle),
              #00D084,
              #A855F7,
              #00A8FF,
              #FFD600,
              #00D084
            ) border-box;
          animation: justRgbRun 7s linear infinite;
        }

        .just-rgb-soft {
          position: relative;
          border: 1px solid rgba(255,255,255,0.08);
          background:
            linear-gradient(#111d1b, #111d1b) padding-box,
            conic-gradient(
              from var(--just-angle),
              rgba(0,208,132,0.55),
              rgba(168,85,247,0.35),
              rgba(0,168,255,0.40),
              rgba(255,214,0,0.35),
              rgba(0,208,132,0.55)
            ) border-box;
          animation: justRgbRun 8s linear infinite;
        }

        .just-kpi {
          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;
        }

        .just-kpi:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 18px rgba(0,208,132,0.12),
            0 18px 30px rgba(0,0,0,0.18);
          border-color: rgba(0,208,132,0.42);
        }

        .just-scroll::-webkit-scrollbar {
          height: 9px;
          width: 9px;
        }

        .just-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
        }

        .just-scroll::-webkit-scrollbar-thumb {
          background: rgba(189,193,214,0.22);
          border-radius: 999px;
        }

        .just-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0,208,132,0.40);
        }
      `}</style>

      <div className="pt-8">
        <Container>

          <Header
            title="Justificadas"
            subtitle="Controle das árvores justificadas e seus impactos na operação"
          />

          {/* TÍTULO DA ÁREA */}
          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2D3A]">
                  <AlertTriangle
                    size={22}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">
                    Controle de Justificadas
                  </h2>

                  <p className="mt-1 text-sm text-[#9AA1BA]">
                    
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={limparFiltros}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl border border-white/10
                bg-[#2B2D3A] px-4 py-2.5
                text-sm font-bold text-[#F8F8F2]
                transition
                hover:border-[#00D084]/50
                hover:bg-[#343746]
              "
            >
              <RotateCcw size={16} />
              Limpar filtros
            </button>

          </div>

          {/* FILTROS */}
          <div className="just-rgb mt-8 rounded-2xl p-[1px]">

            <div className="rounded-2xl bg-[#101815] p-5 lg:p-6">

              {/* CABEÇALHO DOS FILTROS */}
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#21222C] shadow-inner">
                    <Filter
                      size={20}
                      className="text-[#00D084]"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      Filtros
                    </h3>

                    <p className="mt-1 text-xs font-medium text-[#7E849F]">
                      
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={limparFiltros}
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    border border-white/10
                    bg-[#21222C]
                    px-4 py-2.5
                    text-xs font-extrabold
                    uppercase tracking-[0.08em]
                    text-[#BDC1D6]
                    transition
                    hover:border-[#00D084]/40
                    hover:bg-[#343746]
                    hover:text-white
                  "
                >
                  <RotateCcw size={15} />
                  Limpar filtros
                </button>

              </div>

              {/* CAMPOS */}
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* BUSCA */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7E849F]">
                    <Search size={14} className="text-[#00D084]" />
                    Buscar
                  </label>

                  <div className="relative">
                    <input
                      value={busca}
                      onChange={(e) =>
                        setBusca(e.target.value)
                      }
                      placeholder="UT, árvore, espécie..."
                      className="
                        h-12 w-full rounded-xl
                        border border-[#343746]
                        bg-[#21222C]
                        px-4
                        text-sm font-semibold text-white
                        outline-none
                        placeholder:text-[#5F667F]
                        transition
                        focus:border-[#00D084]/70
                        focus:bg-[#262936]
                        focus:ring-2
                        focus:ring-[#00D084]/10
                      "
                    />

                    {busca && (
                      <button
                        type="button"
                        onClick={() => setBusca("")}
                        className="
                          absolute right-2.5 top-1/2
                          -translate-y-1/2
                          rounded-lg px-2 py-1
                          text-xs font-black
                          text-[#7E849F]
                          hover:bg-white/5
                          hover:text-white
                        "
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* UT */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7E849F]">
                    <MapPinned size={14} className="text-[#00D084]" />
                    UT
                  </label>

                  <div className="relative">
                    <select
                      value={filtroUT}
                      onChange={(e) =>
                        setFiltroUT(e.target.value)
                      }
                      className="
                        h-12 w-full appearance-none rounded-xl
                        border border-[#343746]
                        bg-[#21222C]
                        px-4 pr-10
                        text-sm font-semibold text-white
                        outline-none
                        transition
                        focus:border-[#00D084]/70
                        focus:bg-[#262936]
                        focus:ring-2
                        focus:ring-[#00D084]/10
                      "
                    >
                      <option value="TODAS">
                        Todas as UTs
                      </option>

                      {uts.map((ut) => (
                        <option
                          key={ut}
                          value={ut}
                        >
                          {ut}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E849F]"
                    />
                  </div>
                </div>

                {/* ESPÉCIE */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7E849F]">
                    <Leaf size={14} className="text-[#00A8FF]" />
                    Espécie
                  </label>

                  <div className="relative">
                    <select
                      value={filtroEspecie}
                      onChange={(e) =>
                        setFiltroEspecie(e.target.value)
                      }
                      className="
                        h-12 w-full appearance-none rounded-xl
                        border border-[#343746]
                        bg-[#21222C]
                        px-4 pr-10
                        text-sm font-semibold text-white
                        outline-none
                        transition
                        focus:border-[#00A8FF]/70
                        focus:bg-[#262936]
                        focus:ring-2
                        focus:ring-[#00A8FF]/10
                      "
                    >
                      <option value="TODAS">
                        Todas as espécies
                      </option>

                      {especies.map((especie) => (
                        <option
                          key={especie}
                          value={especie}
                        >
                          {especie}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E849F]"
                    />
                  </div>
                </div>

                {/* MOTIVO */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7E849F]">
                    <AlertTriangle size={14} className="text-red-400" />
                    Motivo
                  </label>

                  <div className="relative">
                    <select
                      value={filtroMotivo}
                      onChange={(e) =>
                        setFiltroMotivo(e.target.value)
                      }
                      className="
                        h-12 w-full appearance-none rounded-xl
                        border border-[#343746]
                        bg-[#21222C]
                        px-4 pr-10
                        text-sm font-semibold text-white
                        outline-none
                        transition
                        focus:border-red-400/70
                        focus:bg-[#262936]
                        focus:ring-2
                        focus:ring-red-400/10
                      "
                    >
                      <option value="TODOS">
                        Todos os motivos
                      </option>

                      {motivos.map((motivo) => (
                        <option
                          key={motivo}
                          value={motivo}
                        >
                          {motivo}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E849F]"
                    />
                  </div>
                </div>

              </div>

              {/* RESUMO DOS FILTROS */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#7E849F]">
                    Resultado:
                  </span>

                  <span className="rounded-full border border-[#00D084]/20 bg-[#00D084]/10 px-3 py-1 text-xs font-black text-[#7CFFB2]">
                    {filtrados.length.toLocaleString("pt-BR")} registros
                  </span>

                  {filtroUT !== "TODAS" && (
                    <span className="rounded-full border border-white/10 bg-[#21222C] px-3 py-1 text-xs font-bold text-[#BDC1D6]">
                      UT {filtroUT}
                    </span>
                  )}

                  {filtroEspecie !== "TODAS" && (
                    <span className="rounded-full border border-[#00A8FF]/20 bg-[#00A8FF]/10 px-3 py-1 text-xs font-bold text-[#8BE9FD]">
                      {filtroEspecie}
                    </span>
                  )}

                  {filtroMotivo !== "TODOS" && (
                    <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                      {filtroMotivo}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-[#626A84]">
                  
                </span>

              </div>

            </div>
          </div>

          {/* KPIs */}
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            <div className="just-kpi relative flex min-h-[170px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-red-500/25 bg-[#151011] p-6 text-center">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-900 via-red-500 to-red-200" />

              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-300">
                  Justificadas
                </p>

                <p className="mt-3 text-5xl font-black leading-none text-white">
                  {total.toLocaleString("pt-BR")}
                </p>

                <p className="mt-3 text-sm font-semibold text-[#9AA1BA]">
                  Árvores no filtro atual
                </p>

                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle
                    size={20}
                    className="text-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="just-kpi just-rgb-soft flex min-h-[170px] flex-col items-center justify-center rounded-2xl p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9AA1BA]">
                  UTs envolvidas
                </p>

                <p className="mt-3 text-5xl font-black leading-none text-white">
                  {totalUTs.toLocaleString("pt-BR")}
                </p>

                <p className="mt-3 text-sm font-semibold text-[#9AA1BA]">
                  Unidades com justificativas
                </p>

                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2D3A]">
                  <MapPinned
                    size={20}
                    className="text-[#00D084]"
                  />
                </div>
              </div>
            </div>

            <div className="just-kpi just-rgb-soft flex min-h-[170px] flex-col items-center justify-center rounded-2xl p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9AA1BA]">
                  Espécies
                </p>

                <p className="mt-3 text-5xl font-black leading-none text-white">
                  {totalEspecies.toLocaleString("pt-BR")}
                </p>

                <p className="mt-3 text-sm font-semibold text-[#9AA1BA]">
                  Espécies afetadas
                </p>

                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2D3A]">
                  <Leaf
                    size={20}
                    className="text-[#00A8FF]"
                  />
                </div>
              </div>
            </div>



          </div>

          {/* ESPAÇO ENTRE OS CARDS SUPERIORES E OS DESTAQUES */}
          <div className="h-10" />

          {/* VISÃO RÁPIDA */}
          <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-2">

            <div className="min-h-[190px] rounded-2xl border border-white/10 bg-[#0C1715] p-7 text-center">
              <div className="flex h-full flex-col items-center justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7E849F]">
                  Principal motivo
                </p>

                <h3 className="mt-3 text-2xl font-black text-white">
                  {principalMotivo}
                </h3>

                <div className="mt-4 rounded-xl bg-red-500/10 px-5 py-2">
                  <span className="text-2xl font-black text-red-400">
                    {rankingMotivos[0]?.quantidade ?? 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#21222C]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-500 to-red-200"
                  style={{
                    width: `${Math.max(
                      8,
                      ((rankingMotivos[0]?.quantidade ?? 0) /
                        maxMotivo) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="min-h-[190px] rounded-2xl border border-white/10 bg-[#0C1715] p-7 text-center">
              <div className="flex h-full flex-col items-center justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7E849F]">
                  Espécie com mais justificativas
                </p>

                <h3 className="mt-3 text-2xl font-black text-white">
                  {principalEspecie}
                </h3>

                <div className="mt-4 rounded-xl bg-[#00A8FF]/10 px-5 py-2">
                  <span className="text-2xl font-black text-[#00A8FF]">
                    {rankingEspecies[0]?.quantidade ?? 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#21222C]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00558F] via-[#00A8FF] to-[#8BE9FD] shadow-[0_0_14px_rgba(139,233,253,0.18)] shadow-[0_0_12px_rgba(139,233,253,0.16)]"
                  style={{
                    width: `${Math.max(
                      8,
                      ((rankingEspecies[0]?.quantidade ?? 0) /
                        maxEspecie) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>

          {/* ESPAÇO ENTRE OS DESTAQUES E OS RANKINGS */}
          <div className="h-12" />

          {/* RANKINGS */}
          <div className="mt-2 grid grid-cols-1 gap-6 xl:grid-cols-2">

            <div className="min-h-[420px] rounded-2xl border border-white/10 bg-[#0C1715] p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle
                    size={19}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Motivos das justificativas
                  </h3>

                  <p className="text-sm text-[#7E849F]">
                    Distribuição dos principais motivos
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {rankingMotivos.length === 0 ? (
                  <p className="text-sm text-[#7E849F]">
                    Nenhum dado encontrado.
                  </p>
                ) : (
                  rankingMotivos.map((item) => (
                    <div key={item.nome}>

                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-bold text-[#BDC1D6]">
                          {item.nome}
                        </span>

                        <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-black text-red-300">
                          {item.quantidade}
                        </span>
                      </div>

                      <div className="h-5 overflow-hidden rounded-full bg-[#21222C]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7f1d1d] via-red-500 to-[#fca5a5] shadow-[0_0_14px_rgba(248,113,113,0.20)] shadow-[0_0_12px_rgba(248,113,113,0.18)]"
                          style={{
                            width: `${Math.max(
                              6,
                              (item.quantidade /
                                maxMotivo) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="min-h-[420px] rounded-2xl border border-white/10 bg-[#0C1715] p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A8FF]/10">
                  <Leaf
                    size={19}
                    className="text-[#00A8FF]"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Espécies mais justificadas
                  </h3>

                  <p className="text-sm text-[#7E849F]">
                    Maior concentração por espécie
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {rankingEspecies.length === 0 ? (
                  <p className="text-sm text-[#7E849F]">
                    Nenhum dado encontrado.
                  </p>
                ) : (
                  rankingEspecies.map((item) => (
                    <div key={item.nome}>

                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-bold text-[#BDC1D6]">
                          {item.nome}
                        </span>

                        <span className="shrink-0 rounded-full bg-[#00A8FF]/10 px-2.5 py-1 text-xs font-black text-[#8BE9FD]">
                          {item.quantidade}
                        </span>
                      </div>

                      <div className="h-5 overflow-hidden rounded-full bg-[#21222C]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00558F] via-[#00A8FF] to-[#8BE9FD] shadow-[0_0_12px_rgba(139,233,253,0.16)]"
                          style={{
                            width: `${Math.max(
                              6,
                              (item.quantidade /
                                maxEspecie) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* MAIS RESPIRO APÓS OS GRÁFICOS */}
          <div className="h-12" />

        </Container>
      </div>
    </MainLayout>
  );
}
