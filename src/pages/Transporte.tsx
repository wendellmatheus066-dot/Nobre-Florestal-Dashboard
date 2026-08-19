import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import ReactECharts from "echarts-for-react";
import { supabase } from "../lib/supabase";

import {
  Truck,
  ClipboardList,
} from "lucide-react";

type Registro = {
  [key: string]: any;
};

type Motorista = {
  motorista: string;
  viagens: number;
  toras: number;
  florestal: number;
  comercial: number;
  media: number;
};

function pegar(
  linha: Registro,
  ...nomes: string[]
): string {
  for (const nome of nomes) {
    if (
      linha[nome] !== undefined &&
      linha[nome] !== null &&
      linha[nome] !== ""
    ) {
      return String(linha[nome]);
    }
  }

  return "";
}

function numero(valor: any): number {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return 0;
  }

  if (typeof valor === "number") {
    return valor;
  }

  let texto = String(valor).trim();

  if (
    texto.includes(",") &&
    texto.includes(".")
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const valorNumerico = Number(texto);

  return Number.isFinite(valorNumerico)
    ? valorNumerico
    : 0;
}

export default function Transporte() {
  const [registros, setRegistros] =
    useState<Registro[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  // ==================================================
  // CARREGAR TRANSPORTE
  // ==================================================

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        // O Supabase retorna no máximo 1.000 registros por consulta.
        // Buscamos em páginas para não perder toras quando a tabela passar de 1.000.
        const pagina = 1000;
        let inicio = 0;
        const todosOsDados: any[] = [];

        while (true) {
          const { data, error } = await supabase
            .from("transporte")
            .select("dados")
            .range(inicio, inicio + pagina - 1);

          if (error) {
            throw error;
          }

          if (!data || data.length === 0) {
            break;
          }

          todosOsDados.push(...data);

          if (data.length < pagina) {
            break;
          }

          inicio += pagina;
        }

        const dados =
          todosOsDados.map(
            (item: any) => item.dados
          );

        setRegistros(dados);
      } catch (error: any) {
        console.error(
          "Erro ao carregar Transporte:",
          error
        );

        setErro(
          error?.message ||
            "Erro ao carregar os dados."
        );
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // ==================================================
  // MOTORISTAS
  // ==================================================

  const motoristas =
    useMemo<Motorista[]>(() => {
      const mapa =
        new Map<string, Motorista>();

      for (const linha of registros) {
        const motorista =
          pegar(
            linha,
            "Motorista",
            "MOTORISTA"
          ) || "SEM MOTORISTA";

        if (!mapa.has(motorista)) {
          mapa.set(motorista, {
            motorista,
            viagens: 0,
            toras: 0,
            florestal: 0,
            comercial: 0,
            media: 0,
          });
        }

        const dados =
          mapa.get(motorista)!;

        // =========================================
        // TORAS
        // Cada registro da base representa uma tora.
        // =========================================
        dados.toras += 1;

        dados.florestal += numero(
          linha["Florestal M3"] ??
            linha["Florestal M³"] ??
            linha["Florestal"]
        );

        dados.comercial += numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        );
      }

      // =========================================
      // VIAGENS = ROMANEIOS/NFs ÚNICOS POR MOTORISTA
      // =========================================
      const viagensPorMotorista = new Map<string, Set<string>>();

      for (const linha of registros) {
        const motorista =
          pegar(
            linha,
            "Motorista",
            "MOTORISTA"
          ) || "SEM MOTORISTA";

        const romaneio = pegar(
          linha,
          "Romaneio",
          "ROMANEIO",
          "NF",
          "Nf",
          "Nota Fiscal",
          "NOTA FISCAL"
        ).trim();

        if (!viagensPorMotorista.has(motorista)) {
          viagensPorMotorista.set(motorista, new Set<string>());
        }

        if (romaneio) {
          viagensPorMotorista.get(motorista)!.add(romaneio);
        }
      }

      for (const [nome, romaneios] of viagensPorMotorista) {
        const motorista = mapa.get(nome);

        if (motorista) {
          motorista.viagens = romaneios.size;
        }
      }

      for (const motorista of mapa.values()) {
        motorista.media =
          motorista.viagens > 0
            ? motorista.comercial / motorista.viagens
            : 0;
      }

      return Array.from(mapa.values()).sort(
        (a, b) => b.comercial - a.comercial
      );
    }, [registros]);

  // ==================================================
  // GRÁFICOS: ESPÉCIE E UT
  // ==================================================

  const graficoEspecies =
    useMemo(() => {
      const mapa = new Map<string, number>();

      for (const linha of registros) {
        const especie =
          pegar(
            linha,
            "Espécie",
            "ESPÉCIE",
            "Especie",
            "ESPECIE"
          ) || "SEM ESPÉCIE";

        const volume = numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        );

        mapa.set(
          especie,
          (mapa.get(especie) || 0) + volume
        );
      }

      return Array.from(mapa.entries())
        .map(([nome, volume]) => ({ nome, volume }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);
    }, [registros]);

  const graficoUT =
    useMemo(() => {
      const mapa = new Map<string, number>();

      for (const linha of registros) {
        const ut =
          pegar(
            linha,
            "UT",
            "UT Inventário",
            "UT INVENTÁRIO",
            "Nº UT",
            "Nº UT Inventário",
            "Numero UT"
          ) || "SEM UT";

        const volume = numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        );

        mapa.set(
          ut,
          (mapa.get(ut) || 0) + volume
        );
      }

      return Array.from(mapa.entries())
        .map(([nome, volume]) => ({ nome, volume }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);
    }, [registros]);


  const graficoClientes =
    useMemo(() => {
      const mapa = new Map<string, { nome: string; volume: number; toras: number }>();

      for (const linha of registros) {
        const cliente =
          pegar(
            linha,
            "cliente",
            "Cliente",
            "CLIENTE"
          ).trim() || "SEM CLIENTE";

        const volume = numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        );

        const atual = mapa.get(cliente) || {
          nome: cliente,
          volume: 0,
          toras: 0,
        };

        atual.volume += volume;
        atual.toras += 1;

        mapa.set(cliente, atual);
      }

      return Array.from(mapa.values())
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);
    }, [registros]);

  // ==================================================
  // TOTAIS
  // ==================================================

  const totalRomaneios =
    new Set(
      registros.map((linha) =>
        pegar(linha, "Romaneio", "ROMANEIO")
      ).filter(Boolean)
    ).size;

  const totalToras =
    registros.length;

  const totalFlorestal =
    registros.reduce(
      (total, linha) =>
        total +
        numero(
          linha["Florestal M3"] ??
            linha["Florestal M³"] ??
            linha["Florestal"]
        ),
      0
    );

  const totalComercial =
    registros.reduce(
      (total, linha) =>
        total +
        numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        ),
      0
    );

  const mediaRomaneio =
    totalRomaneios > 0
      ? totalComercial / totalRomaneios
      : 0;

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">

            <Truck
              size={36}
              className="mx-auto text-[#8BE9FD]"
            />

            <p className="mt-3 text-sm font-semibold text-white">
              Carregando Transporte...
            </p>

          </div>
        </div>
      </MainLayout>
    );
  }

  // ==================================================
  // ERRO
  // ==================================================

  if (erro) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
          {erro}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <style>{`

        @keyframes trkRgbBorder {

          0% {
            box-shadow:
              0 0 0 1px rgba(80,250,123,.75),
              0 0 12px rgba(80,250,123,.18);
          }

          33% {
            box-shadow:
              0 0 0 1px rgba(139,233,253,.75),
              0 0 12px rgba(139,233,253,.18);
          }

          66% {
            box-shadow:
              0 0 0 1px rgba(255,121,198,.75),
              0 0 12px rgba(255,121,198,.18);
          }

          100% {
            box-shadow:
              0 0 0 1px rgba(80,250,123,.75),
              0 0 12px rgba(80,250,123,.18);
          }

        }

        .rgb-card {
          animation:
            trkRgbBorder 4s linear infinite;
        }

      `}</style>


      <div className="w-full max-w-[1450px] mx-auto px-6">

        {/* ========================================= */}
        {/* CABEÇALHO */}
        {/* ========================================= */}

        <div className="mb-5 text-center">

          <div className="flex items-center justify-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#343746]">

              <Truck
                size={25}
                className="text-[#8BE9FD]"
              />

            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#50FA7B]">
                TRK FLOREST
              </p>

              <h1 className="text-2xl font-black text-white">
                Transporte
              </h1>

            </div>

          </div>

          <p className="mt-2 text-sm text-[#BDC1D6]">
            
          </p>

        </div>


        {/* ========================================= */}
        {/* CARDS */}
        {/* ========================================= */}

        <div className="
          mx-auto
          mb-0
          w-full
          max-w-[1250px]
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-5
        ">

          {/* ROMANEIOS */}

          <div className="
            rgb-card
            min-h-[104px]
            rounded-2xl
            border
            border-[#4A5168]
            bg-[#343746]
            px-4
            py-3
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ">

            <div className="flex h-full items-center justify-center gap-4">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#282A36]
              ">

                <ClipboardList
                  size={23}
                  className="text-[#50FA7B]"
                />

              </div>

              <div className="min-w-0 text-center">

                <p className="text-xs font-medium text-[#9AA1BA]">
                  Romaneios
                </p>

                <p className="mt-1 text-2xl font-black leading-none text-white">
                  {totalRomaneios}
                </p>

              </div>

            </div>

          </div>


          {/* TORAS */}

          <div className="
            rgb-card
            min-h-[104px]
            rounded-2xl
            border
            border-[#4A5168]
            bg-[#343746]
            px-4
            py-3
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ">

            <div className="flex h-full items-center justify-center gap-4">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#282A36]
              ">

                <Truck
                  size={23}
                  className="text-[#8BE9FD]"
                />

              </div>

              <div className="min-w-0 text-center">

                <p className="text-xs font-medium text-[#9AA1BA]">
                  Toras
                </p>

                <p className="mt-1 text-2xl font-black leading-none text-white">
                  {totalToras}
                </p>

              </div>

            </div>

          </div>


          {/* FLORESTAL */}

          <div className="
            rgb-card
            min-h-[104px]
            rounded-2xl
            border
            border-[#4A5168]
            bg-[#343746]
            px-4
            py-3
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ">

            <div className="flex h-full items-center justify-center gap-4">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#282A36]
              ">

                <Truck
                  size={23}
                  className="text-[#50FA7B]"
                />

              </div>

              <div className="min-w-0 text-center">

                <p className="text-xs font-medium text-[#9AA1BA]">
                  Florestal
                </p>

                <p className="
                  mt-1
                  whitespace-nowrap
                  text-2xl
                  font-black
                  leading-none
                  text-[#50FA7B]
                ">

                  {totalFlorestal.toFixed(2)}

                  <span className="ml-1 text-xs">
                    m³
                  </span>

                </p>

              </div>

            </div>

          </div>


          {/* COMERCIAL */}

          <div className="
            rgb-card
            min-h-[104px]
            rounded-2xl
            border
            border-[#4A5168]
            bg-[#343746]
            px-4
            py-3
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ">

            <div className="flex h-full items-center justify-center gap-4">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#282A36]
              ">

                <Truck
                  size={23}
                  className="text-[#8BE9FD]"
                />

              </div>

              <div className="min-w-0 text-center">

                <p className="text-xs font-medium text-[#9AA1BA]">
                  Comercial
                </p>

                <p className="
                  mt-1
                  whitespace-nowrap
                  text-2xl
                  font-black
                  leading-none
                  text-[#8BE9FD]
                ">

                  {totalComercial.toFixed(2)}

                  <span className="ml-1 text-xs">
                    m³
                  </span>

                </p>

              </div>

            </div>

          </div>


          {/* MÉDIA */}

          <div className="
            rgb-card
            min-h-[104px]
            rounded-2xl
            border
            border-[#4A5168]
            bg-[#343746]
            px-4
            py-3
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ">

            <div className="flex h-full items-center justify-center gap-4">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#282A36]
              ">

                <Truck
                  size={23}
                  className="text-[#FFB86C]"
                />

              </div>

              <div className="min-w-0 text-center">

                <p className="text-xs font-medium text-[#9AA1BA]">
                  Média / Romaneio
                </p>

                <p className="
                  mt-1
                  whitespace-nowrap
                  text-2xl
                  font-black
                  leading-none
                  text-[#FFB86C]
                ">

                  {mediaRomaneio.toFixed(2)}

                  <span className="ml-1 text-xs">
                    m³
                  </span>

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ESPAÇO ENTRE OS CARDS E DESEMPENHO */}

        <div className="h-16" />


        {/* ========================================= */}
        {/* DESEMPENHO DOS MOTORISTAS */}
        {/* ========================================= */}

        <div className="
          rgb-card
          mx-auto
          w-full
          max-w-[1250px]
          rounded-2xl
          border
          border-[#44475A]
          bg-[#343746]
          overflow-hidden
          shadow-[0_8px_24px_rgba(0,0,0,0.14)]
        ">

          {/* CABEÇALHO */}

          <div className="
            flex
            flex-col
            items-center
            justify-center
            gap-1.5
            border-b
            border-[#44475A]
            px-4
            py-2.5
            text-center
          ">

            <div className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-[#282A36]
            ">

              <Truck
                size={19}
                className="text-[#50FA7B]"
              />

            </div>

            <div>

              <h2 className="
                text-xl
                font-black
                text-white
                text-center
              ">
                Desempenho dos Motoristas
              </h2>

              <p className="
                text-xs
                text-[#BDC1D6]
                text-center
              ">
                
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* DESKTOP - TABELA */}
          {/* ================================================= */}

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full table-fixed">

              <thead>

                <tr className="border-b border-[#44475A]">

                  <th className="
                    w-[30%]
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Motorista
                  </th>

                  <th className="
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Viagens
                  </th>

                  <th className="
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Toras
                  </th>

                  <th className="
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Florestal
                  </th>

                  <th className="
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Comercial
                  </th>

                  <th className="
                    px-2.5
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Média
                  </th>

                </tr>

              </thead>

              <tbody>

                {motoristas.map(
                  (item, index) => (

                    <tr
                      key={item.motorista}
                      className="
                        border-b
                        border-[#44475A]
                        last:border-0
                        hover:bg-[#3B3E4D]
                      "
                    >

                      <td className="px-2.5 py-2 text-center">

                        <div className="
                          mx-auto
                          grid
                          w-full
                          max-w-[430px]
                          grid-cols-[40px_1fr]
                          items-center
                          gap-2
                        ">

                          <div className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            justify-self-center
                            rounded-lg
                            bg-[#282A36]
                          ">

                            <Truck
                              size={14}
                              className={
                                index === 0
                                  ? "text-[#50FA7B]"
                                  : "text-[#8BE9FD]"
                              }
                            />

                          </div>

                          <span className="
                            text-left
                            text-sm
                            font-bold
                            text-white
                            whitespace-nowrap
                          ">
                            {item.motorista}
                          </span>

                        </div>

                      </td>

                      <td className="
                        px-2.5
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-white
                      ">
                        {item.viagens}
                      </td>

                      <td className="
                        px-2.5
                        py-2
                        text-center
                        text-sm
                        text-white
                      ">
                        {item.toras}
                      </td>

                      <td className="
                        px-2.5
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-[#50FA7B]
                      ">
                        {item.florestal.toFixed(2)} m³
                      </td>

                      <td className="
                        px-2.5
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-[#8BE9FD]
                      ">
                        {item.comercial.toFixed(2)} m³
                      </td>

                      <td className="
                        px-2.5
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-[#FFB86C]
                      ">
                        {item.media.toFixed(2)} m³
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {/* ================================================= */}
          {/* CELULAR - TABELA COMPACTA */}
          {/* ================================================= */}

          <div className="block md:hidden">

            <div className="w-full overflow-x-auto">

              <table className="min-w-[700px] w-full table-fixed">

                <thead>

                  <tr className="border-b border-[#44475A]">

                    <th className="w-[32%] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Motorista
                    </th>

                    <th className="w-[13%] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Viagens
                    </th>

                    <th className="w-[13%] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Toras
                    </th>

                    <th className="w-[14%] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Florestal
                    </th>

                    <th className="w-[14%] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Comercial
                    </th>

                    <th className="w-[14%] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#7F87A8]">
                      Média
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {motoristas.map((item, index) => (

                    <tr
                      key={item.motorista}
                      className="
                        border-b
                        border-[#44475A]
                        last:border-0
                      "
                    >

                      <td className="px-3 py-2">

                        <div className="flex items-center gap-2">

                          <div className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#282A36]
                          ">

                            <Truck
                              size={14}
                              className={
                                index === 0
                                  ? "text-[#50FA7B]"
                                  : "text-[#8BE9FD]"
                              }
                            />

                          </div>

                          <span className="
                            whitespace-nowrap
                            text-xs
                            font-bold
                            text-white
                          ">
                            {item.motorista}
                          </span>

                        </div>

                      </td>

                      <td className="
                        px-2
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-white
                      ">
                        {item.viagens}
                      </td>

                      <td className="
                        px-2
                        py-2
                        text-center
                        text-xs
                        text-white
                      ">
                        {item.toras}
                      </td>

                      <td className="
                        whitespace-nowrap
                        px-2
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-[#50FA7B]
                      ">
                        {item.florestal.toFixed(2)}
                      </td>

                      <td className="
                        whitespace-nowrap
                        px-2
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-[#8BE9FD]
                      ">
                        {item.comercial.toFixed(2)}
                      </td>

                      <td className="
                        whitespace-nowrap
                        px-2
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-[#FFB86C]
                      ">
                        {item.media.toFixed(2)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>


        {/* ESPAÇO ENTRE DESEMPENHO E GRÁFICOS */}

        <div className="h-12" />

        {/* ========================================= */}
        {/* GRÁFICOS DE TRANSPORTE */}
        {/* ========================================= */}

<div className="mx-auto grid w-full max-w-[1250px] grid-cols-1 gap-6 lg:grid-cols-2">

          {/* PRODUÇÃO POR CLIENTE */}
          <div className="rgb-card overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-[0_12px_35px_rgba(0,0,0,0.20)] lg:col-span-2">

            <div className="relative border-b border-[#44475A] px-6 pb-4 pt-5">
              <div className="flex w-full flex-col items-center justify-center text-center">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Vol. Transportado Por Cliente
                </h2>
                <p className="mt-1 text-xs text-[#9AA1BA]">
                 
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 sm:px-5">
              {graficoClientes.length === 0 ? (
                <div className="flex h-[390px] items-center justify-center text-sm text-[#7F87A8]">
                  Nenhum cliente encontrado nos dados de transporte.
                </div>
              ) : (
                <ReactECharts
                  option={{
                    animation: true,
                    animationDuration: 700,
                    grid: {
                      left: 48,
                      right: 18,
                      top: 58,
                      bottom: 80,
                      containLabel: true,
                    },
                    tooltip: {
                      trigger: "axis",
                      axisPointer: { type: "shadow" },
                      backgroundColor: "#21222C",
                      borderColor: "#44475A",
                      textStyle: { color: "#FFFFFF", fontWeight: 700 },
                      formatter: (params: any[]) => {
                        const nome = params[0]?.name ?? "";
                        const volume = params.find((item: any) => item.seriesName === "Volume Comercial (m³)");
                        const toras = params.find((item: any) => item.seriesName === "Total de Toras");

                        return [
                          `<b>${nome}</b>`,
                          volume
                            ? `Volume Comercial: <b>${Number(volume.value).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} m³</b>`
                            : "",
                          toras
                            ? `Total de Toras: <b>${Number(toras.value).toLocaleString("pt-BR")}</b>`
                            : "",
                        ].filter(Boolean).join("<br/>");
                      },
                    },
                    legend: {
                      top: 8,
                      left: 12,
                      right: "auto",
                      itemWidth: 18,
                      itemHeight: 10,
                      itemGap: 16,
                      textStyle: {
                        color: "#BDC1D6",
                        fontSize: 10,
                        fontWeight: 700,
                      },
                    },
                    xAxis: {
                      type: "category",
                      data: graficoClientes.map((item) => item.nome),
                      axisLabel: {
                        color: "#BDC1D6",
                        fontSize: 10,
                        fontWeight: 700,
                        interval: 0,
                        rotate: graficoClientes.length > 4 ? 28 : 0,
                        formatter: (value: string) =>
                          value.length > 14 ? `${value.slice(0, 14)}…` : value,
                      },
                      axisLine: { lineStyle: { color: "#4A5168" } },
                      axisTick: { show: false },
                    },
                    yAxis: [
                      {
                        type: "value",
                        name: "",
                        position: "left",
                        nameTextStyle: {
                          color: "#FFB86C",
                          fontWeight: 700,
                        },
                        axisLabel: {
                          color: "#FFB86C",
                          fontSize: 10,
                          formatter: (value: number) => `${value}`,
                        },
                        splitLine: {
                          lineStyle: {
                            color: "rgba(255,255,255,0.055)",
                          },
                        },
                        axisLine: { show: false },
                      },
                      {
                        type: "value",
                        name: "",
                        position: "right",
                        nameTextStyle: {
                          color: "#50FA7B",
                          fontWeight: 700,
                        },
                        axisLabel: {
                          color: "#50FA7B",
                          fontSize: 10,
                          formatter: (value: number) => `${value}`,
                        },
                        splitLine: {
                          show: false,
                        },
                        axisLine: { show: false },
                      },
                    ],
                    series: [
                      {
                        name: "Volume Comercial (m³)",
                        type: "bar",
                        yAxisIndex: 0,
                        data: graficoClientes.map((item) => item.volume),
                        barMaxWidth: 34,
                        barGap: "15%",
                        itemStyle: {
                          borderRadius: [8, 8, 2, 2],
                          color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                              { offset: 0, color: "#FFB86C" },
                              { offset: 1, color: "#BD93F9" },
                            ],
                          },
                        },
                        label: {
                          show: true,
                          position: "top",
                          color: "#FFB86C",
                          fontSize: 10,
                          fontWeight: 900,
                          formatter: (params: any) =>
                            Number(params.value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                        },
                      },
                      {
                        name: "Total de Toras",
                        type: "bar",
                        yAxisIndex: 1,
                        data: graficoClientes.map((item) => item.toras),
                        barMaxWidth: 34,
                        itemStyle: {
                          borderRadius: [8, 8, 2, 2],
                          color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                              { offset: 0, color: "#8BE9FD" },
                              { offset: 1, color: "#50FA7B" },
                            ],
                          },
                        },
                        label: {
                          show: true,
                          position: "top",
                          color: "#50FA7B",
                          fontSize: 10,
                          fontWeight: 900,
                          formatter: (params: any) => `${params.value}`,
                        },
                      },
                    ],
                  }}
                  style={{ height: "430px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              )}
            </div>
          </div>

          {/* PRODUÇÃO POR ESPÉCIE */}
          <div className="rgb-card overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-[0_12px_35px_rgba(0,0,0,0.20)]">

            <div className="relative border-b border-[#44475A] px-6 pb-4 pt-5">
              <div className="flex w-full flex-col items-center justify-center text-center">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Vol. Transportado por Espécie
                </h2>
                <p className="mt-1 text-xs text-[#9AA1BA]">
                  Volume comercial transportado por espécie
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 sm:px-5">
              {graficoEspecies.length === 0 ? (
                <div className="flex h-[390px] items-center justify-center text-sm text-[#7F87A8]">
                  Nenhuma espécie encontrada nos dados de transporte.
                </div>
              ) : (
                <ReactECharts
                  option={{
                    animation: true,
                    animationDuration: 700,
                    grid: {
                      left: 48,
                      right: 18,
                      top: 30,
                      bottom: 72,
                      containLabel: true,
                    },
                    tooltip: {
                      trigger: "axis",
                      axisPointer: { type: "shadow" },
                      backgroundColor: "#21222C",
                      borderColor: "#44475A",
                      textStyle: { color: "#FFFFFF", fontWeight: 700 },
                      formatter: (params: any[]) => {
                        const p = params[0];
                        return `${p.name}<br/><b>${Number(p.value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³</b>`;
                      },
                    },
                    xAxis: {
                      type: "category",
                      data: graficoEspecies.map((item) => item.nome),
                      axisLabel: {
                        color: "#BDC1D6",
                        fontSize: 10,
                        fontWeight: 700,
                        interval: 0,
                        rotate: graficoEspecies.length > 6 ? 28 : 0,
                      },
                      axisLine: { lineStyle: { color: "#4A5168" } },
                      axisTick: { show: false },
                    },
                    yAxis: {
                      type: "value",
                      name: "m³",
                      nameTextStyle: { color: "#7F87A8", fontWeight: 700 },
                      axisLabel: {
                        color: "#7F87A8",
                        fontSize: 10,
                        formatter: (value: number) => `${value}`,
                      },
                      splitLine: {
                        lineStyle: { color: "rgba(255,255,255,0.055)" },
                      },
                      axisLine: { show: false },
                    },
                    series: [{
                      name: "Comercial",
                      type: "bar",
                      data: graficoEspecies.map((item) => item.volume),
                      barMaxWidth: 42,
                      barMinHeight: 4,
                      itemStyle: {
                        borderRadius: [8, 8, 2, 2],
                        color: {
                          type: "linear",
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 1,
                          colorStops: [
                            { offset: 0, color: "#8BE9FD" },
                            { offset: 1, color: "#50FA7B" },
                          ],
                        },
                      },
                      label: {
                        show: true,
                        position: "top",
                        color: "#50FA7B",
                        fontSize: 10,
                        fontWeight: 900,
                        formatter: (params: any) => `${Number(params.value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      },
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 18,
                          shadowColor: "rgba(80,250,123,0.30)",
                        },
                      },
                    }],
                  }}
                  style={{ height: "390px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              )}
            </div>
          </div>

          {/* PRODUÇÃO POR UT */}
          <div className="rgb-card overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-[0_12px_35px_rgba(0,0,0,0.20)]">

            <div className="relative border-b border-[#44475A] px-6 pb-4 pt-5">
              <div className="flex w-full flex-col items-center justify-center text-center">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Vol. transportado por UT
                </h2>
                <p className="mt-1 text-xs text-[#9AA1BA]">
                  Volume comercial transportado por UT
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 sm:px-5">
              {graficoUT.length === 0 ? (
                <div className="flex h-[390px] items-center justify-center text-sm text-[#7F87A8]">
                  Nenhuma UT encontrada nos dados de transporte.
                </div>
              ) : (
                <ReactECharts
                  option={{
                    animation: true,
                    animationDuration: 700,
                    grid: {
                      left: 48,
                      right: 18,
                      top: 30,
                      bottom: 62,
                      containLabel: true,
                    },
                    tooltip: {
                      trigger: "axis",
                      axisPointer: { type: "shadow" },
                      backgroundColor: "#21222C",
                      borderColor: "#44475A",
                      textStyle: { color: "#FFFFFF", fontWeight: 700 },
                      formatter: (params: any[]) => {
                        const p = params[0];
                        return `${p.name}<br/><b>${Number(p.value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³</b>`;
                      },
                    },
                    xAxis: {
                      type: "category",
                      data: graficoUT.map((item) => `UT ${item.nome}`),
                      axisLabel: {
                        color: "#BDC1D6",
                        fontSize: 10,
                        fontWeight: 800,
                        interval: 0,
                      },
                      axisLine: { lineStyle: { color: "#4A5168" } },
                      axisTick: { show: false },
                    },
                    yAxis: {
                      type: "value",
                      name: "m³",
                      nameTextStyle: { color: "#7F87A8", fontWeight: 700 },
                      axisLabel: {
                        color: "#7F87A8",
                        fontSize: 10,
                      },
                      splitLine: {
                        lineStyle: { color: "rgba(255,255,255,0.055)" },
                      },
                      axisLine: { show: false },
                    },
                    series: [{
                      name: "Comercial",
                      type: "bar",
                      data: graficoUT.map((item) => item.volume),
                      barMaxWidth: 48,
                      barMinHeight: 4,
                      itemStyle: {
                        borderRadius: [8, 8, 2, 2],
                        color: {
                          type: "linear",
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 1,
                          colorStops: [
                            { offset: 0, color: "#BD93F9" },
                            { offset: 1, color: "#8BE9FD" },
                          ],
                        },
                      },
                      label: {
                        show: true,
                        position: "top",
                        color: "#8BE9FD",
                        fontSize: 10,
                        fontWeight: 900,
                        formatter: (params: any) => `${Number(params.value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      },
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 18,
                          shadowColor: "rgba(139,233,253,0.30)",
                        },
                      },
                    }],
                  }}
                  style={{ height: "390px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              )}
            </div>
          </div>

        </div>
      </div>

    </MainLayout>
  );
}