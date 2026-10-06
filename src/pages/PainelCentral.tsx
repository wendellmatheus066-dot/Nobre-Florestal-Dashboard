import React, {
  useEffect,
  useState,
} from "react";

import MainLayout from "../components/layout/MainLayout";
import Container from "../components/layout/Container";
import Header from "../components/layout/Header";

import { useExcel } from "../hooks/useExcel";
import { useFilters } from "../context/FilterContext";
import { processDashboardData } from "../services/dataProcessor";

import {
  contarInventarioExplorar,
} from "../services/supabaseExcel";

import { supabase } from "../lib/supabase";

import {
  processarArraste,
  calcularStatsArraste,
} from "../processors/arraste";

import {
  processarMedicao,
  calcularStatsMedicao,
} from "../processors/medicao";


// =====================================================
// CONVERTER NÚMEROS
// =====================================================

function converterNumero(valor: any): number {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return 0;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  let texto = String(valor).trim();

  if (!texto) {
    return 0;
  }

  texto = texto.replace(/\s/g, "");

  // 1.847,62
  if (
    texto.includes(".") &&
    texto.includes(",")
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  }

  // 1847,62
  else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;
}


// =====================================================
// NORMALIZAR DATA
// =====================================================

function normalizarData(
  valor: any
): string {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "";
  }

  // Datas vindas do Excel/JS.
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return (
      `${valor.getFullYear()}-` +
      `${String(valor.getMonth() + 1).padStart(2, "0")}-` +
      `${String(valor.getDate()).padStart(2, "0")}`
    );
  }

  const texto = String(valor).trim();

  // ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss...
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  // Número serial do Excel (ex.: 45800).
  if (/^\d+(?:\.\d+)?$/.test(texto)) {
    const serial = Number(texto);
    if (serial > 20000 && serial < 80000) {
      const data = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return (
        `${data.getUTCFullYear()}-` +
        `${String(data.getUTCMonth() + 1).padStart(2, "0")}-` +
        `${String(data.getUTCDate()).padStart(2, "0")}`
      );
    }
  }

  // DD/MM/YYYY ou MM/DD/YYYY.
  if (texto.includes("/")) {
    const partes = texto.split("/");

    if (partes.length !== 3) {
      return "";
    }

    let primeiro = Number(partes[0]);
    let segundo = Number(partes[1]);
    let ano = String(partes[2]).replace(/\s.*/, "");

    if (
      !Number.isFinite(primeiro) ||
      !Number.isFinite(segundo) ||
      !Number.isFinite(Number(ano))
    ) {
      return "";
    }

    if (ano.length === 2) {
      ano = `20${ano}`;
    }

    let dia: number;
    let mes: number;

    if (primeiro > 12) {
      dia = primeiro;
      mes = segundo;
    } else if (segundo > 12) {
      mes = primeiro;
      dia = segundo;
    } else {
      // Padrão atual dos dados.
      mes = primeiro;
      dia = segundo;
    }

    if (
      mes < 1 || mes > 12 ||
      dia < 1 || dia > 31
    ) {
      return "";
    }

    return (
      `${ano}-` +
      `${String(mes).padStart(2, "0")}-` +
      `${String(dia).padStart(2, "0")}`
    );
  }

  return "";
}


// =====================================================
// CALCULAR MÉDIA DIÁRIA DE QUANTIDADE
// =====================================================

function calcularMediaDiaria(
  registros: any[],
  getData: (registro: any) => any,
  getQuantidade: (
    registro: any
  ) => number
): number {

  const producaoPorDia =
    new Map<string, number>();

  registros.forEach(
    (registro) => {

      const data =
        normalizarData(
          getData(registro)
        );

      if (!data) {
        return;
      }

      const quantidade =
        Number(
          getQuantidade(registro) || 0
        );

      if (
        !Number.isFinite(
          quantidade
        ) ||
        quantidade <= 0
      ) {
        return;
      }

      producaoPorDia.set(
        data,
        (
          producaoPorDia.get(data) ??
          0
        ) + quantidade
      );
    }
  );

  if (
    producaoPorDia.size === 0
  ) {
    return 0;
  }

  let total = 0;

  producaoPorDia.forEach(
    (quantidade) => {
      total += quantidade;
    }
  );

  return (
    total /
    producaoPorDia.size
  );
}


// =====================================================
// CALCULAR DATA DE PREVISÃO
// =====================================================

function calcularPrevisao(
  faltante: number,
  mediaDiaria: number,
  dataInicio?: Date | null
): Date | null {

  if (
    faltante <= 0 ||
    mediaDiaria <= 0
  ) {
    return null;
  }

  const diasNecessarios =
    Math.ceil(
      faltante /
      mediaDiaria
    );

  const data =
    dataInicio
      ? new Date(dataInicio)
      : new Date();

  data.setHours(
    0,
    0,
    0,
    0
  );

  data.setDate(
    data.getDate() +
    diasNecessarios
  );

  return data;
}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
  data: Date | null
): string {

  if (!data) {
    return "Concluído";
  }

  return data.toLocaleDateString(
    "pt-BR"
  );
}


// =====================================================
// RANKING DE DESTAQUES
// =====================================================

function calcularRanking(
  registros: any[],
  getPessoa: (registro: any) => any,
  getQuantidade: (registro: any) => number
) {
  const mapa = new Map<string, number>();

  registros.forEach((registro) => {
    const pessoa = String(getPessoa(registro) ?? "").trim();

    if (!pessoa) {
      return;
    }

    const quantidade = Number(getQuantidade(registro) || 0);

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      return;
    }

    mapa.set(
      pessoa,
      (mapa.get(pessoa) ?? 0) + quantidade
    );
  });

  return Array.from(mapa.entries())
    .map(([nome, producao]) => ({
      nome,
      producao,
    }))
    .sort((a, b) => b.producao - a.producao)
    .slice(0, 3);
}


// =====================================================
// SAUDAÇÃO E FRASE MOTIVACIONAL
// =====================================================

function obterSaudacao() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

const frasesMotivacionais = [
  {
    texto: "Tudo posso naquele que me fortalece.",
    referencia: "Filipenses 4:13",
  },
  {
    texto: "O Senhor é o meu pastor; nada me faltará.",
    referencia: "Salmos 23:1",
  },
  {
    texto: "Confia no Senhor de todo o teu coração.",
    referencia: "Provérbios 3:5",
  },
  {
    texto: "Entrega o teu caminho ao Senhor; confia nele.",
    referencia: "Salmos 37:5",
  },
  {
    texto: "O Senhor é a minha luz e a minha salvação; de quem terei medo?",
    referencia: "Salmos 27:1",
  },
  {
    texto: "Seja forte e corajoso. Não tenha medo.",
    referencia: "Josué 1:9",
  },
  {
    texto: "Este é o dia que o Senhor fez; alegremo-nos e exultemos nele.",
    referencia: "Salmos 118:24",
  },
  {
    texto: "O Senhor pelejará por vós, e vós vos calareis.",
    referencia: "Êxodo 14:14",
  },
  {
    texto: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.",
    referencia: "Salmos 46:1",
  },
  {
    texto: "Tudo tem o seu tempo determinado.",
    referencia: "Eclesiastes 3:1",
  },
  {
    texto: "Aquele que habita no esconderijo do Altíssimo descansará à sombra do Onipotente.",
    referencia: "Salmos 91:1",
  },
  {
    texto: "Não temas, porque eu sou contigo.",
    referencia: "Isaías 41:10",
  },
  {
    texto: "Os que esperam no Senhor renovarão as suas forças.",
    referencia: "Isaías 40:31",
  },
  {
    texto: "O Senhor firma os passos de um homem.",
    referencia: "Salmos 37:23",
  },
  {
    texto: "Bem-aventurado aquele que confia no Senhor.",
    referencia: "Jeremias 17:7",
  },
  {
    texto: "Buscai primeiro o Reino de Deus e a sua justiça.",
    referencia: "Mateus 6:33",
  },
  {
    texto: "Porque para Deus nada será impossível.",
    referencia: "Lucas 1:37",
  },
  {
    texto: "A minha graça te basta.",
    referencia: "2 Coríntios 12:9",
  },
  {
    texto: "O Senhor é bom, uma fortaleza no dia da angústia.",
    referencia: "Naum 1:7",
  },
  {
    texto: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança.",
    referencia: "Salmos 4:8",
  },
  {
    texto: "Lança o teu cuidado sobre o Senhor, e ele te susterá.",
    referencia: "Salmos 55:22",
  },
  {
    texto: "O coração alegre aformoseia o rosto.",
    referencia: "Provérbios 15:13",
  },
  {
    texto: "A fé é a certeza daquilo que esperamos.",
    referencia: "Hebreus 11:1",
  },
  {
    texto: "Sede fortes, e fortaleça-se o vosso coração.",
    referencia: "Salmos 31:24",
  },
  {
    texto: "O Senhor dará força ao seu povo; o Senhor abençoará o seu povo com paz.",
    referencia: "Salmos 29:11",
  },
  {
    texto: "O Senhor está perto dos que têm o coração quebrantado.",
    referencia: "Salmos 34:18",
  },
  {
    texto: "Aquietai-vos e sabei que eu sou Deus.",
    referencia: "Salmos 46:10",
  },
  {
    texto: "Em todas estas coisas somos mais que vencedores.",
    referencia: "Romanos 8:37",
  },
  {
    texto: "Se Deus é por nós, quem será contra nós?",
    referencia: "Romanos 8:31",
  },
  {
    texto: "O Senhor é a minha força e o meu escudo.",
    referencia: "Salmos 28:7",
  },
];


// =====================================================
// CONTROLE DE REFUGO
// =====================================================

const MOTIVOS_REFUGO = [
  "cortada desc.no mato",
];

function normalizarTexto(valor: any): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function obterValorPrimeiro(
  linha: any,
  chaves: string[]
): any {
  for (const chave of chaves) {
    const valor = linha?.[chave];

    if (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {
      return valor;
    }
  }

  return "";
}

function obterChaveArvore(
  linha: any
): string {
  const ut = obterValorPrimeiro(
    linha,
    [
      "UT",
      "UT Inventário",
      "UT INVENTÁRIO",
      "Nº UT",
      "Nº UT ",
    ]
  );

  const arvore = obterValorPrimeiro(
    linha,
    [
      "Nº ÁRVORE",
      "Nº Árvore",
      "Nr. Árvore",
      "Nr. Arvore",
      "Nº ARVORE",
      "Nr. ÁRVORE",
      "Arvore",
      "Árvore",
    ]
  );

  if (
    String(ut).trim() === "" &&
    String(arvore).trim() === ""
  ) {
    return "";
  }

  return `${String(ut).trim()}|${String(arvore).trim()}`;
}

function ehRefugoArraste(
  linha: any
): boolean {
  const motivo = normalizarTexto(
    obterValorPrimeiro(
      linha,
      [
        "MOTIVO",
        "Motivo",
      ]
    )
  );

  return MOTIVOS_REFUGO.some(
    (item) => motivo === normalizarTexto(item)
  );
}


// =====================================================
// PAINEL CENTRAL
// =====================================================

const PainelCentral: React.FC =
  () => {

  const saudacao = obterSaudacao();

  const [fraseMotivacional] = useState(() => {
    return frasesMotivacionais[
      Math.floor(
        Math.random() * frasesMotivacionais.length
      )
    ];
  });


    const { data } =
      useExcel();

    const { filters } =
      useFilters();

    // Usa exatamente o mesmo processamento/filtro da aba Medição.
    const dashboardMedicao =
      processDashboardData(
        data,
        filters.medicao
      );


    // =================================================
    // META DERRUBA
    // =================================================

    const [
      metaDerruba,
      setMetaDerruba,
    ] = useState(0);

    const [
      carregandoMeta,
      setCarregandoMeta,
    ] = useState(true);


    // =================================================
    // TRANSPORTE
    // =================================================

    const [
      dadosTransporte,
      setDadosTransporte,
    ] = useState<any[]>([]);

    const [
      carregandoTransporte,
      setCarregandoTransporte,
    ] = useState(true);


    // =================================================
    // ARRASTE - DADOS DIRETOS DO SUPABASE
    // =================================================

    const [
      dadosArrastePainel,
      setDadosArrastePainel,
    ] = useState<any[]>([]);

    const [
      carregandoArraste,
      setCarregandoArraste,
    ] = useState(true);


    // =================================================
    // BUSCAR META DO INVENTÁRIO
    // =================================================

    useEffect(() => {

      async function carregarMeta() {

        try {

          setCarregandoMeta(
            true
          );

          const total =
            await contarInventarioExplorar();

          setMetaDerruba(
            total
          );

        } catch (error) {

          console.error(
            "Erro carregando meta do Derruba:",
            error
          );

          setMetaDerruba(0);

        } finally {

          setCarregandoMeta(
            false
          );

        }

      }

      carregarMeta();

    }, []);


    // =================================================
    // BUSCAR ARRASTE DIRETAMENTE DO SUPABASE
    // =================================================

    useEffect(() => {

      async function carregarArraste() {

        try {

          setCarregandoArraste(true);

          const tamanhoPagina = 1000;

          let inicio = 0;

          const todos: any[] = [];

          while (true) {

            const {
              data: pagina,
              error,
            } = await supabase
              .from("arraste")
              .select("dados")
              .order("id", {
                ascending: true,
              })
              .range(
                inicio,
                inicio + tamanhoPagina - 1
              );

            if (error) {
              throw error;
            }

            if (!pagina || pagina.length === 0) {
              break;
            }

            todos.push(
              ...pagina.map((item: any) => item.dados)
            );

            if (pagina.length < tamanhoPagina) {
              break;
            }

            inicio += tamanhoPagina;
          }

          console.log(
            "PAINEL - ARRASTE CARREGADO:",
            todos.length
          );

          setDadosArrastePainel(todos);

        } catch (error) {

          console.error(
            "Erro carregando Arraste no Painel Central:",
            error
          );

          setDadosArrastePainel([]);

        } finally {

          setCarregandoArraste(false);

        }

      }

      carregarArraste();

    }, []);


    // =================================================
    // BUSCAR TRANSPORTE
    // =================================================

    useEffect(() => {

      async function carregarTransporte() {

        try {

          setCarregandoTransporte(
            true
          );

          const tamanhoPagina =
            1000;

          let inicio = 0;

          const todos: any[] =
            [];

          while (true) {

            const {
              data: pagina,
              error,
            } =
              await supabase
                .from(
                  "transporte"
                )
                .select("dados")
                .order("id", {
                  ascending: true,
                })
                .range(
                  inicio,
                  inicio +
                    tamanhoPagina -
                    1
                );

            if (error) {
              throw error;
            }

            if (
              !pagina ||
              pagina.length === 0
            ) {
              break;
            }

            todos.push(
              ...pagina
            );

            if (
              pagina.length <
              tamanhoPagina
            ) {
              break;
            }

            inicio +=
              tamanhoPagina;
          }

          setDadosTransporte(
            todos.map(
              (item: any) =>
                item.dados
            )
          );

        } catch (error) {

          console.error(
            "Erro carregando Transporte:",
            error
          );

          setDadosTransporte([]);

        } finally {

          setCarregandoTransporte(
            false
          );

        }

      }

      carregarTransporte();

    }, []);


    // =================================================
    // DADOS
    // =================================================

    const producao =
      data["PRODUÇÃO"] ?? [];

    const justificadas =
      data["JUSTIFICADAS"] ?? [];

    const dadosArraste =
      dadosArrastePainel;

    // Árvores marcadas como refugo no Arraste não entram
    // como produção válida do Arraste e também não seguem
    // para a Medição.
    const chavesRefugo = new Set(
      dadosArraste
        .filter(ehRefugoArraste)
        .map(obterChaveArvore)
        .filter(Boolean)
    );

    const dadosArrasteValidos =
      dadosArraste.filter(
        (row) => !ehRefugoArraste(row)
      );

    const refugadasArrasteTotal =
      dadosArraste
        .filter(ehRefugoArraste)
        .reduce(
          (total: number, row: any) =>
            total +
            converterNumero(
              row["qtd"] ??
              row["QTD"] ??
              row["Qtd"] ??
              0
            ),
          0
        );

    const dadosMedicaoBrutos =
      dashboardMedicao.medicao ?? [];

    const dadosMedicaoValidos =
      dadosMedicaoBrutos.filter(
        (row) => {
          const chave = obterChaveArvore(row);

          return (
            !chave ||
            !chavesRefugo.has(chave)
          );
        }
      );


    // =================================================
    // DERRUBA
    // =================================================

    const derrubadas =
      producao.length;

    const justificadasTotal =
      justificadas.length;

    const derrubaResolvido =
      derrubadas +
      justificadasTotal;

    const derrubaFaltante =
      Math.max(
        metaDerruba -
          derrubaResolvido,
        0
      );

    const percentualDerruba =
      metaDerruba > 0
        ? Math.min(
            Math.round(
              (
                derrubaResolvido /
                metaDerruba
              ) *
              100
            ),
            100
          )
        : 0;


    // =================================================
    // MÉDIA DERRUBA
    // =================================================

    const mediaDerruba =
      calcularMediaDiaria(
        producao,

        (row) =>
          row["Data do Corte"],

        () => 1
      );


    // =================================================
    // PREVISÃO DERRUBA
    // =================================================

    const previsaoDerruba =
      calcularPrevisao(
        derrubaFaltante,
        mediaDerruba
      );


    // =================================================
    // ARRASTE
    // =================================================

    const registrosArraste =
      processarArraste(
        dadosArrasteValidos
      );

    const statsArraste =
      calcularStatsArraste(
        registrosArraste
      );

    const arvoresArrastadas =
      statsArraste.producaoTotal;

    // Refugadas contam para a conclusão da etapa do Arraste,
    // mas não seguem para a Medição e não entram na média.
    const arvoresResolvidasArraste =
      arvoresArrastadas +
      refugadasArrasteTotal;

    const metaArraste =
      derrubadas;

    const arrasteFaltante =
      Math.max(
        metaArraste -
          arvoresResolvidasArraste,
        0
      );

    const percentualArraste =
      metaArraste > 0
        ? Math.min(
            Math.round(
              (
                arvoresResolvidasArraste /
                metaArraste
              ) *
              100
            ),
            100
          )
        : 0;


    // =================================================
    // MÉDIA ARRASTE
    // =================================================

    // Usa exatamente os mesmos dados já processados
    // pelo módulo original de Arraste.
    // Assim a média e a previsão não dependem do nome
    // bruto da coluna no Supabase.
    const mediaArraste =
      calcularMediaDiaria(
        dadosArrasteValidos,

        (row) =>
          row["Data Patio"] ??
          row["Data Pátio"] ??
          row["DATA"] ??
          row["Data"],

        (row) =>
          converterNumero(
            row["qtd"] ??
            row["QTD"] ??
            row["Qtd"] ??
            0
          )
      );


    // =================================================
    // PREVISÃO ARRASTE
    // =================================================

    const previsaoArraste =
      calcularPrevisao(
        arrasteFaltante,
        mediaArraste,
        previsaoDerruba
      );


    // =================================================
    // MEDIÇÃO
    // =================================================

    const registrosMedicao =
      processarMedicao(
        dadosMedicaoValidos
      );

    const statsMedicao =
      calcularStatsMedicao(
        registrosMedicao
      );

    const arvoresMedidas =
      statsMedicao.arvores;

    const metaMedicao =
      arvoresArrastadas;

    const medicaoFaltante =
      Math.max(
        metaMedicao -
          arvoresMedidas,
        0
      );

    const percentualMedicao =
      metaMedicao > 0
        ? Math.min(
            Math.round(
              (
                arvoresMedidas /
                metaMedicao
              ) *
              100
            ),
            100
          )
        : 0;


    // =================================================
    // MÉDIA MEDIÇÃO
    // =================================================

    const mediaMedicao =
      calcularMediaDiaria(
        registrosMedicao,

        (row) =>
          row.data,

        (row) =>
          Number(
            row.arvores ?? 0
          )
      );


    // =================================================
    // PREVISÃO MEDIÇÃO
    // =================================================

    const previsaoMedicao =
      calcularPrevisao(
        medicaoFaltante,
        mediaMedicao,
        previsaoArraste
      );


    // =================================================
    // TRANSPORTE
    // =================================================

    const metaTransporte =
      statsMedicao.volumeComercial;


    const volumeTransportado =
      dadosTransporte.reduce(
        (
          total: number,
          linha: any
        ) => {

          const volume =
            linha[
              "Comercial M3"
            ] ??
            linha[
              "Comercial M³"
            ] ??
            linha[
              "Comercial"
            ] ??
            0;

          return (
            total +
            converterNumero(
              volume
            )
          );

        },
        0
      );


    const transporteFaltante =
      Math.max(
        metaTransporte -
          volumeTransportado,
        0
      );


    const percentualTransporte =
      metaTransporte > 0
        ? Math.min(
            Math.round(
              (
                volumeTransportado /
                metaTransporte
              ) *
              100
            ),
            100
          )
        : 0;


    // =================================================
    // MÉDIA TRANSPORTE
    // =================================================

    const mediaTransporte =
      calcularMediaDiaria(
        dadosTransporte,

        (row) =>
          row["Data"],

        (row) =>
          converterNumero(
            row[
              "Comercial M3"
            ] ??
            row[
              "Comercial M³"
            ] ??
            row[
              "Comercial"
            ] ??
            0
          )
      );


    // =================================================
    // PREVISÃO TRANSPORTE
    // =================================================

    const previsaoTransporte =
      calcularPrevisao(
        transporteFaltante,
        mediaTransporte,
        previsaoMedicao
      );


    // =================================================
    // DESTAQUES DA OPERAÇÃO
    // =================================================

    // Derruba: produção por motosserrista.
    const rankingDerruba = calcularRanking(
      producao,
      (row) => row["Motoserrista Corte"],
      () => 1
    );

    // Arraste: produção por skideiro.
    const rankingArraste = calcularRanking(
      dadosArrasteValidos,
      (row) =>
        row["Skideiro Patio"] ??
        row["Skideiro Pátio"] ??
        row["Skideiro"],
      (row) =>
        converterNumero(
          row["qtd"] ??
          row["QTD"] ??
          row["Qtd"] ??
          0
        )
    );

    // Transporte: volume comercial por motorista.
    const rankingTransporte = calcularRanking(
      dadosTransporte,
      (row) => row["Motorista"],
      (row) =>
        converterNumero(
          row["Comercial M3"] ??
          row["Comercial M³"] ??
          row["Comercial"] ??
          0
        )
    );


    // =================================================
    // RENDER
    // =================================================

    return (

      <MainLayout>

        <style>{`
          @property --trk-rgb-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes trkRgbBorder {
            to { --trk-rgb-angle: 360deg; }
          }
          .trk-rgb-card {
            border: 2px solid transparent !important;
            background:
              linear-gradient(#0b1917, #0b1917) padding-box,
              conic-gradient(from var(--trk-rgb-angle), #A855F7, #00D084, #FFD600, #00D084, #00A8FF, #A855F7) border-box !important;
            animation: trkRgbBorder 4s linear infinite;
          }
          .trk-rgb-card:hover {
            background:
              linear-gradient(#0d211b, #0d211b) padding-box,
              conic-gradient(from var(--trk-rgb-angle), #A855F7, #00D084, #FFD600, #00D084, #00A8FF, #A855F7) border-box !important;
            box-shadow: 0 0 28px rgba(0,208,132,0.35);
          }

          .trk-rgb-highlight {
            position: relative;
            border: 2px solid transparent;
            background:
              linear-gradient(#141b1c, #141b1c) padding-box,
              conic-gradient(
                from var(--trk-rgb-angle),
                #A855F7,
                #00D084,
                #FFD600,
                #00A8FF,
                #A855F7
              ) border-box;
            animation: trkRgbBorder 4s linear infinite;
            box-shadow: 0 0 26px rgba(0, 208, 132, 0.12);
          }

          .trk-rgb-highlight:hover {
            box-shadow:
              0 0 12px rgba(168, 85, 247, 0.20),
              0 0 24px rgba(0, 208, 132, 0.16),
              0 0 36px rgba(0, 168, 255, 0.12);
          }

          @property --trk-progress-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }

          @keyframes trkProgressRun {
            to {
              --trk-progress-angle: 360deg;
            }
          }

          .trk-progress-ring {
            position: relative;
            overflow: hidden;
            background: #17242b;
          }

          /* Somente a parte preenchida do percentual recebe a cor. */
          .trk-progress-ring::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            pointer-events: none;
          }

          .trk-progress-green::before {
            background: conic-gradient(
              #008F5B,
              #00D084 55%,
              #7CFFB2 100%
            );
            -webkit-mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            -webkit-mask-composite: source-in;
            mask-composite: intersect;
          }

          .trk-progress-orange::before {
            background: conic-gradient(
              #C24100,
              #FF7A00 55%,
              #FFB067 100%
            );
            -webkit-mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            -webkit-mask-composite: source-in;
            mask-composite: intersect;
          }

          .trk-progress-blue::before {
            background: conic-gradient(
              #0066B3,
              #00A8FF 55%,
              #66D0FF 100%
            );
            -webkit-mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            -webkit-mask-composite: source-in;
            mask-composite: intersect;
          }

          .trk-progress-yellow::before {
            background: conic-gradient(
              #A67C00,
              #FFD600 55%,
              #FFF08A 100%
            );
            -webkit-mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 12px),
                #000 calc(100% - 11px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            -webkit-mask-composite: source-in;
            mask-composite: intersect;
          }

          /* Apenas uma pequena faixa branca percorre o arco já preenchido. */
          .trk-progress-ring::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            pointer-events: none;

            background:
              conic-gradient(
                from var(--trk-progress-angle),
                transparent 0deg,
                transparent 354deg,
                rgba(255,255,255,0.15) 355deg,
                rgba(255,255,255,0.95) 356.5deg,
                rgba(255,255,255,0.95) 357.5deg,
                rgba(255,255,255,0.15) 359deg,
                transparent 360deg
              );

            -webkit-mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 7px),
                #000 calc(100% - 6px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );
            mask:
              radial-gradient(
                farthest-side,
                transparent calc(100% - 7px),
                #000 calc(100% - 6px)
              ),
              conic-gradient(
                #000 0 var(--trk-progress),
                transparent var(--trk-progress) 100%
              );

            -webkit-mask-composite: source-in;
            mask-composite: intersect;

            filter: drop-shadow(0 0 3px rgba(255,255,255,0.65));
            animation: trkProgressRun 2.6s linear infinite;
          }

          .trk-rgb-line {
            position: relative;
            height: 3px;
            width: 100%;
            overflow: hidden;
            border-radius: 999px;
            background: #063a2c;
            box-shadow: 0 0 10px rgba(0, 208, 132, 0.16);
          }

          .trk-rgb-line::before {
            content: "";
            position: absolute;
            inset: 0;
            width: 42%;
            border-radius: inherit;
            background: linear-gradient(
              90deg,
              #063a2c 0%,
              #00D084 45%,
              #7CFFB2 50%,
              #00D084 55%,
              #063a2c 100%
            );
            box-shadow:
              0 0 10px rgba(0, 208, 132, 0.45),
              0 0 18px rgba(124, 255, 178, 0.22);
            animation: trkRgbLineRun 2.8s linear infinite;
          }

          @keyframes trkRgbLineRun {
            0% {
              transform: translateX(-115%);
            }
            100% {
              transform: translateX(260%);
            }
          }
        `}</style>

        <div className="pt-08">

          <Container>

            <div style={{ marginBottom: "24px" }}>
              <Header
                title="Painel Central"
                subtitle="Acompanhamento da operação e previsão de término"
              />
            </div>

            {/* SAUDAÇÃO + FRASE MOTIVACIONAL */}
            <div style={{ marginTop: "0px" }}>
              <div
                className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#00D084] via-[#A855F7] to-[#00A8FF]" />

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D084]/10 text-xl text-[#00D084]">
                  ✦
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[#00D084]">
                    {saudacao}, NOBRE!
                  </p>

                  <p className="mt-1 text-sm font-bold leading-relaxed text-white">
                    “{fraseMotivacional.texto}”
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-gray-400">
                    {fraseMotivacional.referencia}
                  </p>
                </div>
              </div>
            </div>

            {/* ESPAÇO ENTRE O CABEÇALHO E OS CARDS */}
            <div className="h-6" />

            {/* ==========================================
                CARDS
            ========================================== */}

            <div
              className="
                mt-0
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-4
              "
            >


              {/* ========================================
                  DERRUBA
              ======================================== */}

              <div
                className="
                  rounded-xl
                  trk-rgb-card
                  border
                  border-[#00D084]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#00D084]
                  hover:shadow-[0_0_28px_rgba(0,208,132,0.35)]
                  hover:bg-[#0d211b]
                  cursor-pointer
                  bg-[#0b1917]
                  min-h-[390px]
                  p-6
                  text-center
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <span className="text-3xl">
                    🌳
                  </span>

                  <span
                    className="
                      text-base
                      font-bold
                      text-green-400
                    "
                  >
                    {percentualDerruba}%
                  </span>

                </div>


                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                    text-center
                  "
                >
                  Derruba
                </h2>


                <p
                  className="
                    mt-1
                    text-base
                    text-gray-400
                    text-center
                  "
                >
                  
                </p>


                {carregandoMeta ? (

                  <p
                    className="
                      mt-5
                      text-sm
                      text-gray-500
                    "
                  >
                    Calculando meta...
                  </p>

                ) : (

                  <>

                    <p
                      className="
                        mt-1
                        text-5xl
                        font-black
                        text-white
                        text-center
                      "
                    >

                      {derrubaResolvido.toLocaleString(
                        "pt-BR"
                      )}

                      <span
                        className="
                          text-lg
                          text-gray-500
                        "
                      >
                        {" / "}
                        {metaDerruba.toLocaleString(
                          "pt-BR"
                        )}
                      </span>

                    </p>
                    <div
                      className="
                        mt-3
                        flex
                        justify-center
                      "
                    >
                      <div
                        className="
                            relative
                            flex
                            h-36
                            w-36
                            items-center
                            justify-center
                            rounded-full
                            trk-progress-ring
                            trk-progress-green
                          "
                          style={
                            {
                              "--trk-progress": `${percentualDerruba}%`,
                            } as React.CSSProperties
                          }
                      >
                        <div
                          className="
                            flex
                            h-[112px]
                            w-[112px]
                            items-center
                            justify-center
                            rounded-full
                            bg-[#081514]
                          "
                        >
                          <span className="text-2xl font-black text-white">
                            {percentualDerruba}%
                          </span>
                        </div>
                      </div>
                    </div>


                    <div
                      className="
                        mt-4
                        space-y-1
                        text-base
                        font-semibold
                        text-gray-300
                        text-center
                      "
                    >

                      <p>
                        {derrubadas.toLocaleString(
                          "pt-BR"
                        )}{" "}
                        derrubadas
                      </p>

                      <p className="text-red-400">
                        {justificadasTotal.toLocaleString(
                          "pt-BR"
                        )}{" "}
                        justificadas
                      </p>

                      <p>
                        Média:{" "}
                        {mediaDerruba.toLocaleString(
                          "pt-BR",
                          {
                            maximumFractionDigits: 1,
                          }
                        )}{" "}
                        árvores/dia
                      </p>

                      <p
                        className="
                          mt-2
                          font-semibold
                          text-white
                        "
                      >
                        {derrubaFaltante > 0
                          ? `Previsão: ${formatarData(
                              previsaoDerruba
                            )}`
                          : "Concluído"}
                      </p>

                    </div>

                  </>

                )}

              </div>


              {/* ========================================
                  ARRASTE
              ======================================== */}

              <div
                className="
                  rounded-xl
                  trk-rgb-card
                  border
                  border-[#FF7A00]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#00D084]
                  hover:shadow-[0_0_28px_rgba(0,208,132,0.35)]
                  hover:bg-[#0d211b]
                  cursor-pointer
                  bg-[#0b1917]
                  min-h-[390px]
                  p-6
                  text-center
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <span className="text-3xl">
                    🪵
                  </span>

                  <span
                    className="
                      text-base
                      font-bold
                      text-orange-400
                    "
                  >
                    {carregandoArraste
                      ? "..."
                      : `${percentualArraste}%`}
                  </span>

                </div>


                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                    text-center
                  "
                >
                  Arraste
                </h2>


                <p
                  className="
                    mt-1
                    text-base
                    text-gray-400
                    text-center
                  "
                >
                  
                </p>


                <p
                  className="
                    mt-1
                    text-5xl
                    font-black
                    text-white
                  "
                >

                  {arvoresResolvidasArraste.toLocaleString(
                    "pt-BR"
                  )}

                  <span
                    className="
                      text-lg
                      text-gray-500
                    "
                  >
                    {" / "}
                    {metaArraste.toLocaleString(
                      "pt-BR"
                    )}
                  </span>

                </p>
                    <div
                      className="
                        mt-3
                        flex
                        justify-center
                      "
                    >
                      <div
                        className="
                            relative
                            flex
                            h-36
                            w-36
                            items-center
                            justify-center
                            rounded-full
                            trk-progress-ring
                            trk-progress-orange
                          "
                          style={
                            {
                              "--trk-progress": `${percentualArraste}%`,
                            } as React.CSSProperties
                          }
                      >
                        <div
                          className="
                            flex
                            h-[112px]
                            w-[112px]
                            items-center
                            justify-center
                            rounded-full
                            bg-[#081514]
                          "
                        >
                          <span className="text-2xl font-black text-white">
                            {percentualArraste}%
                          </span>
                        </div>
                      </div>
                    </div>


                <div
                  className="
                    mt-4
                    space-y-1
                    text-base
                    font-semibold
                    text-gray-300
                    text-center
                  "
                >

                  <p>
                    {arvoresArrastadas.toLocaleString(
                      "pt-BR"
                    )}{" "}
                    arrastadas
                  </p>

                  <p className="text-red-400">
                    {refugadasArrasteTotal.toLocaleString(
                      "pt-BR"
                    )}{" "}
                    refugadas
                  </p>

                  <p>
                    Faltam{" "}
                    {arrasteFaltante.toLocaleString(
                      "pt-BR"
                    )}{" "}
                    árvores
                  </p>

                  <p>
                    Média:{" "}
                    {mediaArraste.toLocaleString(
                      "pt-BR",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}{" "}
                    árvores/dia
                  </p>

                  <p
                    className="
                      mt-2
                      font-semibold
                      text-white
                    "
                  >
                    {arrasteFaltante > 0
                      ? `Previsão: ${formatarData(
                          previsaoArraste
                        )}`
                      : "Concluído"}
                  </p>

                </div>

              </div>


              {/* ========================================
                  MEDIÇÃO
              ======================================== */}

              <div
                className="
                  rounded-xl
                  trk-rgb-card
                  border
                  border-[#00A8FF]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#00D084]
                  hover:shadow-[0_0_28px_rgba(0,208,132,0.35)]
                  hover:bg-[#0d211b]
                  cursor-pointer
                  bg-[#0b1917]
                  min-h-[390px]
                  p-6
                  text-center
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <span className="text-3xl">
                    📏
                  </span>

                  <span
                    className="
                      text-base
                      font-bold
                      text-blue-400
                    "
                  >
                    {percentualMedicao}%
                  </span>

                </div>


                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                    text-center
                  "
                >
                  Medição
                </h2>


                <p
                  className="
                    mt-1
                    text-base
                    text-gray-400
                    text-center
                  "
                >
                  
                </p>


                <p
                  className="
                    mt-1
                    text-5xl
                    font-black
                    text-white
                  "
                >

                  {arvoresMedidas.toLocaleString(
                    "pt-BR"
                  )}

                  <span
                    className="
                      text-lg
                      text-gray-500
                    "
                  >
                    {" / "}
                    {metaMedicao.toLocaleString(
                      "pt-BR"
                    )}
                  </span>

                </p>
                    <div
                      className="
                        mt-3
                        flex
                        justify-center
                      "
                    >
                      <div
                        className="
                            relative
                            flex
                            h-36
                            w-36
                            items-center
                            justify-center
                            rounded-full
                            trk-progress-ring
                            trk-progress-blue
                          "
                          style={
                            {
                              "--trk-progress": `${percentualMedicao}%`,
                            } as React.CSSProperties
                          }
                      >
                        <div
                          className="
                            flex
                            h-[112px]
                            w-[112px]
                            items-center
                            justify-center
                            rounded-full
                            bg-[#081514]
                          "
                        >
                          <span className="text-2xl font-black text-white">
                            {percentualMedicao}%
                          </span>
                        </div>
                      </div>
                    </div>


                <div
                  className="
                    mt-4
                    space-y-1
                    text-base
                    font-semibold
                    text-gray-300
                    text-center
                  "
                >

                  <p>
                    Faltam{" "}
                    {medicaoFaltante.toLocaleString(
                      "pt-BR"
                    )}{" "}
                    árvores
                  </p>

                  <p>
                    Média:{" "}
                    {mediaMedicao.toLocaleString(
                      "pt-BR",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}{" "}
                    árvores/dia
                  </p>

                  <p
                    className="
                      mt-2
                      font-semibold
                      text-white
                    "
                  >
                    {medicaoFaltante > 0
                      ? `Previsão: ${formatarData(
                          previsaoMedicao
                        )}`
                      : "Concluído"}
                  </p>

                </div>

              </div>


              {/* ========================================
                  TRANSPORTE
              ======================================== */}

              <div
                className="
                  rounded-xl
                  trk-rgb-card
                  border
                  border-[#FFD600]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#00D084]
                  hover:shadow-[0_0_28px_rgba(0,208,132,0.35)]
                  hover:bg-[#0d211b]
                  cursor-pointer
                  bg-[#0b1917]
                  min-h-[390px]
                  p-6
                  text-center
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <span className="text-3xl">
                    🚛
                  </span>

                  <span
                    className="
                      text-base
                      font-bold
                      text-yellow-400
                    "
                  >
                    {carregandoTransporte
                      ? "..."
                      : `${percentualTransporte}%`}
                  </span>

                </div>


                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                    text-center
                  "
                >
                  Transporte
                </h2>


                <p
                  className="
                    mt-1
                    text-base
                    text-gray-400
                    text-center
                  "
                >
                  
                </p>


                {carregandoTransporte ? (

                  <p
                    className="
                      mt-1
                      text-3xl
                      font-black
                      text-gray-500
                    "
                  >
                    ...
                  </p>

                ) : (

                  <p
                    className="
                      mt-1
                      text-3xl
                      font-black
                      text-white
                    "
                  >

                    {volumeTransportado.toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                    <span
                      className="
                        text-lg
                        text-gray-500
                      "
                    >
                      {" / "}
                      {metaTransporte.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      m³
                    </span>

                  </p>

                )}
                    <div
                      className="
                        mt-3
                        flex
                        justify-center
                      "
                    >
                      <div
                        className="
                            relative
                            flex
                            h-36
                            w-36
                            items-center
                            justify-center
                            rounded-full
                            trk-progress-ring
                            trk-progress-yellow
                          "
                          style={
                            {
                              "--trk-progress": `${percentualTransporte}%`,
                            } as React.CSSProperties
                          }
                      >
                        <div
                          className="
                            flex
                            h-[112px]
                            w-[112px]
                            items-center
                            justify-center
                            rounded-full
                            bg-[#081514]
                          "
                        >
                          <span className="text-2xl font-black text-white">
                            {percentualTransporte}%
                          </span>
                        </div>
                      </div>
                    </div>


                {!carregandoTransporte && (

                  <div
                    className="
                      mt-4
                      space-y-1
                      text-base
                      font-semibold
                      text-gray-300
                      text-center
                    "
                  >

                    <p>
                      Faltam{" "}
                      {transporteFaltante.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      m³
                    </p>

                    <p>
                      Média:{" "}
                      {mediaTransporte.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      m³/dia
                    </p>

                    <p
                      className="
                        mt-2
                        font-semibold
                        text-white
                      "
                    >
                      {transporteFaltante > 0
                        ? `Previsão: ${formatarData(
                            previsaoTransporte
                          )}`
                        : "Concluído"}
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* ESPAÇO ENTRE OS CARDS PRINCIPAIS E OS DESTAQUES */}
            <div className="h-16" />

            {/* ==========================================
                DESTAQUES DA OPERAÇÃO
            ========================================== */}

            <div className="mt-4 pb-10">

              <div className="mb-8 text-center">

                <div
                  className="
                    trk-rgb-highlight
                    mx-auto inline-flex items-center gap-3
                    rounded-full
                    px-6 py-2.5
                  "
                >
                  <span className="text-xl">🏆</span>

                  <span
                    className="
                      text-base font-extrabold
                      uppercase tracking-[0.22em]
                      text-white
                    "
                  >
                    DESTAQUES DA OPERAÇÃO
                  </span>
                </div>

                <h2
                  className="
                    mt-6
                    text-3xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  
                </h2>

                <p className="mt-3 text-sm font-medium text-gray-400">
                  -
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* DERRUBA */}
                <div
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-[#00D084]/40
                    bg-gradient-to-b from-[#0d201c] to-[#081310]
                    p-5
                    shadow-[0_12px_35px_rgba(0,0,0,0.20)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#00D084]
                    hover:shadow-[0_0_30px_rgba(0,208,132,0.18)]
                  "
                >
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00D084]/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D084]/10 text-2xl">
                        🌳
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          Derruba
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#00D084]">
                          Motosserristas
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 trk-rgb-line" />

                    <div className="mt-5 space-y-2">
                      {rankingDerruba.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">
                          Sem dados
                        </p>
                      ) : (
                        rankingDerruba.map((item, index) => (
                          <div
                            key={item.nome}
                            className={`
                              flex items-center gap-3 rounded-xl px-3 py-3
                              ${index === 0
                                ? "border border-[#00D084]/25 bg-[#00D084]/10"
                                : "bg-white/[0.025]"}
                            `}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 text-lg">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-white">
                                {item.nome}
                              </p>
                            </div>

                            <span className="whitespace-nowrap text-sm font-extrabold text-[#00D084]">
                              {item.producao.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ARRASTE */}
                <div
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-[#FF7A00]/40
                    bg-gradient-to-b from-[#21170d] to-[#0e0d09]
                    p-5
                    shadow-[0_12px_35px_rgba(0,0,0,0.20)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#00D084]
                    hover:shadow-[0_0_30px_rgba(0,208,132,0.18)]
                  "
                >
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#FF7A00]/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-2xl">
                        🪵
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          Arraste
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#FF7A00]">
                          Skideiros
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 trk-rgb-line" />

                    <div className="mt-5 space-y-2">
                      {rankingArraste.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">
                          Sem dados
                        </p>
                      ) : (
                        rankingArraste.map((item, index) => (
                          <div
                            key={item.nome}
                            className={`
                              flex items-center gap-3 rounded-xl px-3 py-3
                              ${index === 0
                                ? "border border-[#FF7A00]/25 bg-[#FF7A00]/10"
                                : "bg-white/[0.025]"}
                            `}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 text-lg">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-white">
                                {item.nome}
                              </p>
                            </div>

                            <span className="whitespace-nowrap text-sm font-extrabold text-[#FF7A00]">
                              {item.producao.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* TRANSPORTE */}
                <div
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-[#FFD600]/40
                    bg-gradient-to-b from-[#211d08] to-[#100f08]
                    p-5
                    shadow-[0_12px_35px_rgba(0,0,0,0.20)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#00D084]
                    hover:shadow-[0_0_30px_rgba(0,208,132,0.18)]
                  "
                >
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#FFD600]/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD600]/10 text-2xl">
                        🚛
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          Transporte
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#FFD600]">
                          Motoristas
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 trk-rgb-line" />

                    <div className="mt-5 space-y-2">
                      {rankingTransporte.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">
                          Sem dados
                        </p>
                      ) : (
                        rankingTransporte.map((item, index) => (
                          <div
                            key={item.nome}
                            className={`
                              flex items-center gap-3 rounded-xl px-3 py-3
                              ${index === 0
                                ? "border border-[#FFD600]/25 bg-[#FFD600]/10"
                                : "bg-white/[0.025]"}
                            `}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 text-lg">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-white">
                                {item.nome}
                              </p>
                            </div>

                            <span className="whitespace-nowrap text-sm font-extrabold text-[#FFD600]">
                              {item.producao.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              m³
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </Container>

        </div>

      </MainLayout>

    );
  };


export default PainelCentral;