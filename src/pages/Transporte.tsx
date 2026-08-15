import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { supabase } from "../lib/supabase";

import {
  Truck,
  ClipboardList,
  Search,
} from "lucide-react";

type Registro = {
  [key: string]: any;
};

type Romaneio = {
  romaneio: string;
  nf: string;
  data: string;
  motorista: string;
  toras: number;
  florestal: number;
  comercial: number;
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

  const [busca, setBusca] =
    useState("");

  const [pagina, setPagina] =
    useState(1);

  const porPagina = 10;

  // ==================================================
  // CARREGAR TRANSPORTE
  // ==================================================

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const { data, error } =
          await supabase
            .from("transporte")
            .select("dados");

        if (error) {
          throw error;
        }

        const dados =
          (data || []).map(
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
  // ROMANEIOS
  // ==================================================

  const romaneios =
    useMemo<Romaneio[]>(() => {
      const mapa =
        new Map<string, Romaneio>();

      for (const linha of registros) {
        const romaneio =
          pegar(
            linha,
            "Romaneio",
            "ROMANEIO"
          ) || "SEM ROMANEIO";

        if (!mapa.has(romaneio)) {
          mapa.set(romaneio, {
            romaneio,

            nf: pegar(
              linha,
              "NF",
              "Nf",
              "nf"
            ),

            data: pegar(
              linha,
              "Data",
              "DATA"
            ),

            motorista: pegar(
              linha,
              "Motorista",
              "MOTORISTA"
            ),

            toras: 0,
            florestal: 0,
            comercial: 0,
          });
        }

        const item =
          mapa.get(romaneio)!;

        item.toras += 1;

        item.florestal += numero(
          linha["Florestal M3"] ??
            linha["Florestal M³"] ??
            linha["Florestal"]
        );

        item.comercial += numero(
          linha["Comercial M3"] ??
            linha["Comercial M³"] ??
            linha["Comercial"]
        );
      }

      return Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          Number(a.romaneio) -
          Number(b.romaneio)
      );
    }, [registros]);

  // ==================================================
  // MOTORISTAS
  // ==================================================

  const motoristas =
    useMemo<Motorista[]>(() => {
      const mapa =
        new Map<string, Motorista>();

      for (const item of romaneios) {
        const motorista =
          item.motorista ||
          "SEM MOTORISTA";

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

        dados.viagens += 1;
        dados.toras += item.toras;

        dados.florestal +=
          item.florestal;

        dados.comercial +=
          item.comercial;
      }

      for (
        const motorista of mapa.values()
      ) {
        motorista.media =
          motorista.viagens > 0
            ? motorista.comercial /
              motorista.viagens
            : 0;
      }

      return Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          b.comercial -
          a.comercial
      );
    }, [romaneios]);

  // ==================================================
  // TOTAIS
  // ==================================================

  const totalRomaneios =
    romaneios.length;

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
      ? totalComercial /
        totalRomaneios
      : 0;

  // ==================================================
  // BUSCA
  // ==================================================

  const filtrados =
    romaneios.filter((item) => {
      const termo =
        busca
          .toLowerCase()
          .trim();

      if (!termo) {
        return true;
      }

      return (
        item.romaneio
          .toLowerCase()
          .includes(termo) ||
        item.nf
          .toLowerCase()
          .includes(termo) ||
        item.motorista
          .toLowerCase()
          .includes(termo)
      );
    });

  // ==================================================
  // PAGINAÇÃO
  // ==================================================

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        filtrados.length /
          porPagina
      )
    );

  const inicio =
    (pagina - 1) *
    porPagina;

  const paginaAtual =
    filtrados.slice(
      inicio,
      inicio + porPagina
    );

  useEffect(() => {
    setPagina(1);
  }, [busca]);

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
            Acompanhamento dos transportes por motorista e romaneio.
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
                Produção acumulada por motorista
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


        {/* ESPAÇO ENTRE DESEMPENHO E ROMANEIOS */}

        <div className="h-12" />


        {/* ========================================= */}
        {/* ROMANEIOS */}
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
            gap-2
            border-b
            border-[#44475A]
            px-3
            py-2
            text-center
          ">

            <div className="
              flex
              items-center
              justify-center
              gap-3
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

                <ClipboardList
                  size={19}
                  className="text-[#BDC1D6]"
                />

              </div>

              <div>

                <h2 className="
                  text-xl
                  font-black
                  text-white
                  text-center
                ">
                  Romaneios
                </h2>

                <p className="
                  text-xs
                  text-[#BDC1D6]
                  text-center
                ">
                  {filtrados.length} romaneios encontrados
                </p>

              </div>

            </div>


            {/* BUSCA */}

            <div className="
              relative
              w-full
              max-w-[360px]
            ">

              <Search
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[#6272A4]
                "
              />

              <input
                value={busca}
                onChange={(e) =>
                  setBusca(
                    e.target.value
                  )
                }
                placeholder="Buscar romaneio, NF ou motorista..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#44475A]
                  bg-[#282A36]
                  pl-10
                  pr-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-[#6272A4]
                  focus:border-[#50FA7B]
                "
              />

            </div>

          </div>


          {/* TABELA ROMANEIOS */}

          <div className="overflow-x-auto">

            <table className="w-full table-fixed">

              <thead>

                <tr className="border-b border-[#44475A]">

                  <th className="
                    w-[12%]
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Romaneio
                  </th>

                  <th className="
                    w-[10%]
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    NF
                  </th>

                  <th className="
                    w-[14%]
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Data
                  </th>

                  <th className="
                    w-[30%]
                    px-3
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
                    px-3
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
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    uppercase
                    text-[#7F87A8]
                  ">
                    Comercial
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginaAtual.map(
                  (item) => (

                    <tr
                      key={`${item.romaneio}-${item.nf}`}
                      className="
                        border-b
                        border-[#44475A]
                        last:border-0
                        hover:bg-[#3B3E4D]
                      "
                    >

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        font-black
                        text-white
                      ">
                        {item.romaneio}
                      </td>

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        text-white
                      ">
                        {item.nf}
                      </td>

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        text-[#BDC1D6]
                      ">
                        {item.data}
                      </td>

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-white
                      ">
                        {item.motorista}
                      </td>

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        text-white
                      ">
                        {item.toras}
                      </td>

                      <td className="
                        px-3
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-[#8BE9FD]
                      ">
                        {item.comercial.toFixed(2)} m³
                      </td>

                    </tr>

                  )
                )}


                {paginaAtual.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="
                        px-5
                        py-8
                        text-center
                        text-sm
                        text-[#BDC1D6]
                      "
                    >
                      Nenhum romaneio encontrado.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* PAGINAÇÃO */}

          <div className="
            flex
            flex-col
            items-center
            justify-center
            gap-3
            border-t
            border-[#44475A]
            px-5
            py-3.5
            sm:flex-row
            sm:justify-between
          ">

            <span className="text-xs text-[#7F87A8]">
              Mostrando{" "}
              {paginaAtual.length}{" "}
              de{" "}
              {filtrados.length}
            </span>


            <div className="
              flex
              items-center
              gap-1
            ">

              <button
                disabled={pagina === 1}
                onClick={() =>
                  setPagina(
                    (p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                  )
                }
                className="
                  h-8
                  w-8
                  rounded-lg
                  border
                  border-[#44475A]
                  text-white
                  disabled:opacity-30
                "
              >
                ‹
              </button>


              {Array.from(
                {
                  length: totalPaginas,
                },
                (_, i) =>
                  i + 1
              ).map(
                (numeroPagina) => (

                  <button
                    key={numeroPagina}
                    onClick={() =>
                      setPagina(
                        numeroPagina
                      )
                    }
                    className={`
                      h-8
                      min-w-8
                      rounded-lg
                      text-xs
                      font-bold

                      ${
                        pagina ===
                        numeroPagina
                          ? "bg-[#50FA7B]/10 text-[#50FA7B]"
                          : "text-[#BDC1D6] hover:bg-[#44475A]"
                      }
                    `}
                  >
                    {numeroPagina}
                  </button>

                )
              )}


              <button
                disabled={
                  pagina ===
                    totalPaginas ||
                  totalPaginas === 0
                }
                onClick={() =>
                  setPagina(
                    (p) =>
                      Math.min(
                        totalPaginas,
                        p + 1
                      )
                  )
                }
                className="
                  h-8
                  w-8
                  rounded-lg
                  border
                  border-[#44475A]
                  text-white
                  disabled:opacity-30
                "
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}