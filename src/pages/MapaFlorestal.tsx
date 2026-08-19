import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  GeoJSON,
  Pane,
} from "react-leaflet";

import { useEffect, useState } from "react";


import { ArrowLeft } from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";

import { useExcelContext } from "../context/ExcelContext";

// ESTRADAS PRINCIPAIS - SHAPE UPA 13
const ESTRADAS_PRINCIPAIS = {"type":"FeatureCollection","name":"estradas_principais","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"Id":0,"Km":4.20709841295},"geometry":{"type":"LineString","coordinates":[[-56.185280564932064,-3.286195324779991],[-56.14741461484557,-3.28616358047128]]}},{"type":"Feature","properties":{"Id":0,"Km":6.46483624827},"geometry":{"type":"LineString","coordinates":[[-56.18303374004854,-3.286193825179197],[-56.18303338980898,-3.277237845918971],[-56.151922391155125,-3.27721220743144],[-56.151924641745595,-3.274538086510204],[-56.151929921626625,-3.268255969244821],[-56.14986546276688,-3.266257455088868],[-56.14867606910549,-3.264748582209051],[-56.14720512269404,-3.260504381301066]]}},{"type":"Feature","properties":{"Id":0,"Km":11.8041634512},"geometry":{"type":"LineString","coordinates":[[-56.1615179567031,-3.446615371153155],[-56.13197766866198,-3.446588792731245],[-56.1320013010891,-3.420416383776091],[-56.132005599433114,-3.414848904422923],[-56.13202970095653,-3.411128711975126],[-56.132602243532816,-3.410077225677857],[-56.13355570779361,-3.406239549507978],[-56.133464095877144,-3.405099702838682],[-56.133037239061,-3.403040980881554],[-56.13242027963131,-3.400503404647007],[-56.13202163393682,-3.397735875089872],[-56.132094203037894,-3.392269765027702],[-56.133047234557,-3.39183980835436],[-56.134000478381815,-3.39117050913258],[-56.13457261985984,-3.390548734870019],[-56.13485896678866,-3.389926703659018],[-56.13485956217466,-3.389256547605367],[-56.13471734578787,-3.38849052677741],[-56.13443219039131,-3.387772246063044],[-56.13419462492264,-3.387101876386143],[-56.133766318501934,-3.386670677128317],[-56.13300467293175,-3.386143441780093],[-56.13209997032123,-3.385797807423272],[-56.13210045343367,-3.3852551010428],[-56.13210084806862,-3.384811721294145],[-56.13210178518478,-3.383758619580441],[-56.13169412087196,-3.382569922781526],[-56.13146847642592,-3.381887596812184],[-56.131409479696956,-3.381277223066946],[-56.13151019751931,-3.38081324595885],[-56.13478047069854,-3.373454740183583]]}}]};

// ========================================
// AJUSTAR MAPA
// ========================================

function AjustarMapa({ pontos }: any) {
  const mapa = useMap();

  useEffect(() => {
    if (pontos.length > 0) {
      const limites = pontos.map((item: any) => [
        Number(item.LATITUDE),
        Number(item.LONGITUDE),
      ]);

      mapa.fitBounds(limites as any, {
        padding: [50, 50],
      });
    }
  }, [pontos, mapa]);

  return null;
}

// ========================================
// MAPA FLORESTAL
// ========================================

export default function MapaFlorestal() {
  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // ESTADOS DOS GEOJSON
  // ========================================

  const [utsGeoJson, setUtsGeoJson] =
    useState<any>(null);

  const [upa13GeoJson, setUpa13GeoJson] =
    useState<any>(null);

  // PESQUISA DE ÁRVORE / DERRUBADOR
  const [buscaMapa, setBuscaMapa] = useState("");

  // ========================================
  // FECHAR MAPA NO SAFARI
  // ========================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        navigate(-1);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [navigate]);

  // ========================================
  // CARREGAR UTs
  // ========================================

  useEffect(() => {
    fetch("/mapas/uts.geojson")
      .then((response) => response.json())
      .then((json) => {
        console.log(
          "UTs carregadas:",
          json
        );

        console.log(
          "Primeira feature:",
          json.features?.[0]
        );

        setUtsGeoJson(json);
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar UTs:",
          erro
        );
      });
  }, []);

  // ========================================
  // CARREGAR UPA 13
  // ========================================

  useEffect(() => {
    fetch("/mapas/upa13_uts.geojson")
      .then((response) => response.json())
      .then((json) => {
        console.log(
          "UPA 13 carregada:",
          json
        );

        setUpa13GeoJson(json);
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar UPA 13:",
          erro
        );
      });
  }, []);

  // ========================================
  // DADOS
  // ========================================

  const { data } = useExcelContext();

  const producao =
    data["PRODUÇÃO"] || [];

  const arraste =
    data["ARRASTE"] || [];

  const medicao =
    data["MEDIÇÃO"] || [];

  const justificadas =
    data["JUSTIFICADAS"] || [];

  const inventario =
    data["INVENTÁRIO"] || [];

  // ========================================
  // LIMPAR NÚMERO
  // ========================================

  function limparNumero(valor: any) {
    if (
      valor === undefined ||
      valor === null
    ) {
      return "";
    }

    return String(valor)
      .trim()
      .replace(/\.0$/, "");
  }

  // ========================================
  // INVENTÁRIO
  // ========================================

  const mapaInventario = new Map();

  inventario.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (numero) {
      mapaInventario.set(
        numero,
        arvore
      );
    }
  });

  // ========================================
  // MAPA DAS ÁRVORES
  // ========================================

  const mapaArvores = new Map();

  // ========================================
  // DERRUBADA
  // ========================================

  producao.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (!numero) {
      return;
    }

    mapaArvores.set(
      numero,
      {
        ...arvore,
        STATUS: "DERRUBADA",
      }
    );
  });

  // ========================================
  // ARRASTE
  // ========================================

  arraste.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (!numero) {
      return;
    }

    mapaArvores.set(
      numero,
      {
        ...arvore,
        STATUS: "ARRASTE",
      }
    );
  });

  // ========================================
  // QUANTIDADE DE TORAS
  // ========================================

  const quantidadeTorasMedicao =
    new Map();

  medicao.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (!numero) {
      return;
    }

    quantidadeTorasMedicao.set(
      numero,
      (quantidadeTorasMedicao.get(
        numero
      ) || 0) + 1
    );
  });

  // ========================================
  // MEDIÇÃO
  // ========================================

  medicao.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (!numero) {
      return;
    }

    mapaArvores.set(
      numero,
      {
        ...arvore,
        STATUS: "MEDIÇÃO",
        QTD_TORAS:
          quantidadeTorasMedicao.get(
            numero
          ) || 0,
      }
    );
  });

  // ========================================
  // JUSTIFICADAS
  // ========================================
  //
  // A coluna correta da tabela
  // JUSTIFICADAS é:
  //
  // "Nr. Árvore"
  //
  // A justificativa entra por último.
  // Portanto, se a mesma árvore estiver
  // em outra operação, JUSTIFICADA terá
  // prioridade.
  // ========================================

  justificadas.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nr. Árvore"]
    );

    if (!numero) {
      console.warn(
        "JUSTIFICADA SEM Nr. Árvore:",
        arvore
      );

      return;
    }

    console.log(
      "JUSTIFICADA PROCESSADA:",
      numero
    );

    mapaArvores.set(
      numero,
      {
        ...arvore,

        "Nº ÁRVORE": numero,

        STATUS: "JUSTIFICADA",

        MOTIVO_JUSTIFICATIVA:
          arvore["Motivo"] || "",
      }
    );
  });

  // ========================================
  // MONTAR PONTOS DO MAPA
  // ========================================

  const pontosMapa: any[] = [];

  mapaArvores.forEach(
    (arvore: any) => {
      const numero = limparNumero(
        arvore["Nº ÁRVORE"]
      );

      const dadosInventario =
        mapaInventario.get(numero);

      if (!dadosInventario) {
        if (
          arvore.STATUS ===
          "JUSTIFICADA"
        ) {
          console.warn(
            "JUSTIFICADA NÃO ENCONTRADA NO INVENTÁRIO:",
            numero
          );
        }

        return;
      }

      pontosMapa.push({
        ...arvore,

        LATITUDE:
          dadosInventario.LATITUDE,

        LONGITUDE:
          dadosInventario.LONGITUDE,

        ESPECIE:
          dadosInventario[
            "NOME COMUM"
          ],

        CAP:
          dadosInventario[
            "CAP (CM)"
          ],

        UPA:
          dadosInventario.UPA,

        UT:
          dadosInventario[
            "Nº UT"
          ],

        MOTOSERRISTA:
          arvore[
            "Motoserrista Corte"
          ],

        SKIDEIRO_PATIO:
          arvore[
            "Skideiro Patio"
          ],

        EQUIPE:
          arvore["Equipe"],

        QTD_TORAS:
          arvore["qtd"],

        VOLUME_TOTAL:
          Number(
            String(
              arvore[
                "Comercial M3"
              ] ??
                dadosInventario[
                  "Comercial M3"
                ] ??
                "0"
            ).replace(",", ".")
          ) || 0,
      });
    }
  );

  // ========================================
  // FILTRO / PESQUISA DO MAPA
  // ========================================

  const pontosMapaFiltrados = pontosMapa.filter((arvore: any) => {
    const busca = buscaMapa.trim().toLowerCase();

    if (!busca) {
      return true;
    }

    const numeroArvore = limparNumero(
      arvore["Nº ÁRVORE"]
    ).toLowerCase();

    const motoserrista = String(
      arvore.MOTOSERRISTA || ""
    ).trim().toLowerCase();

    return (
      numeroArvore.includes(busca) ||
      motoserrista.includes(busca)
    );
  });

  // ========================================
  // TOTAIS
  // ========================================

  const totalDerrubada =
    pontosMapa.filter(
      (p) =>
        p.STATUS ===
        "DERRUBADA"
    ).length;

  const totalArraste =
    pontosMapa.filter(
      (p) =>
        p.STATUS ===
        "ARRASTE"
    ).length;

  const totalMedicao =
    pontosMapa.filter(
      (p) =>
        p.STATUS ===
        "MEDIÇÃO"
    ).length;

  const totalJustificadas =
    pontosMapa.filter(
      (p) =>
        p.STATUS ===
        "JUSTIFICADA"
    ).length;

  // ========================================
  // DEBUG
  // ========================================

  console.log(
    "=============================="
  );

  console.log(
    "TOTAL DERRUBADA:",
    totalDerrubada
  );

  console.log(
    "TOTAL ARRASTE:",
    totalArraste
  );

  console.log(
    "TOTAL MEDIÇÃO:",
    totalMedicao
  );

  console.log(
    "TOTAL JUSTIFICADAS:",
    totalJustificadas
  );

  console.log(
    "TOTAL MAPA:",
    pontosMapa.length
  );

  console.log(
    "=============================="
  );

  // ========================================
  // TELA
  // ========================================

  return (
    <MainLayout>
      <div className="pt-8 w-full">
        <Container>

          <Header
            title="Mapa Operacional"
            subtitle="Derrubada • Arraste • Medição • Justificadas"
          />

          <div className="h-6" />

          <div className="relative h-[600px]">

            {/* ========================================
                PESQUISA ÁRVORE / DERRUBADOR
            ======================================== */}

            <div
              className="
                absolute
                top-3
                left-1/2
                z-[1000]
                w-[min(420px,calc(100%-24px))]
                -translate-x-1/2
                rounded-xl
                border
                border-white/10
                bg-black/60
                p-2
                backdrop-blur-md
                shadow-xl
              "
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🔎</span>

                <input
                  type="text"
                  value={buscaMapa}
                  onChange={(e) =>
                    setBuscaMapa(e.target.value)
                  }
                  placeholder="Nº da árvore ou nome do derrubador"
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                />

                {buscaMapa && (
                  <button
                    type="button"
                    onClick={() => setBuscaMapa("")}
                    className="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10"
                    aria-label="Limpar pesquisa"
                  >
                    ✕
                  </button>
                )}
              </div>

              {buscaMapa.trim() && (
                <div className="mt-1 px-1 text-[11px] text-white/70">
                  {pontosMapaFiltrados.length} árvore(s) encontrada(s)
                </div>
              )}
            </div>

            {/* ========================================
                BOTÃO VOLTAR
            ======================================== */}

            <button
              onClick={() =>
                navigate(-1)
              }
              style={{
                zIndex: 99999,
              }}
              className="
                absolute
                top-20
                left-3
                flex
                items-center
                justify-center
                rounded-xl
                bg-black/80
                p-3
                text-white
                shadow-xl
              "
            >
              <ArrowLeft
                size={24}
              />
            </button>

            {/* ========================================
                PAINEL DE OPERAÇÃO
            ======================================== */}

            <div
              className="
                absolute
                top-3
                right-3
                z-[1000]
                w-48
                rounded-lg
                border
                border-white/10
                bg-black/25
                backdrop-blur-md
                shadow-xl
              "
            >

              <div className="border-b border-white/10 px-3 py-2">
                <h2 className="text-center text-sm font-semibold text-white">
                  🌲 Operação
                </h2>
              </div>

              <div className="space-y-1.5 px-3 py-2">

                {/* DERRUBADA */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-3 w-3 rounded-full bg-red-500" />

                    <span className="text-[13px] text-white/90">
                      Derrubada
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-white">
                    {totalDerrubada}
                  </span>

                </div>

                {/* ARRASTE */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-3 w-3 rounded-full bg-yellow-400" />

                    <span className="text-[13px] text-white/90">
                      Arraste
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-white">
                    {totalArraste}
                  </span>

                </div>

                {/* MEDIÇÃO */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-3 w-3 rounded-full bg-blue-500" />

                    <span className="text-[13px] text-white/90">
                      Medição
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-white">
                    {totalMedicao}
                  </span>

                </div>

                {/* JUSTIFICADAS */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-3 w-3 rounded-full bg-[#A855F7]"></span>

                    <span className="text-[13px] text-white/90">
                      Justificadas
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-white">
                    {totalJustificadas}
                  </span>

                </div>

                {/* ESTRADAS PRINCIPAIS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="block w-4"
                      style={{
                        height: "1.5px",
                        backgroundColor: "#FF3030",
                        opacity: 0.55,
                        borderRadius: "9999px",
                      }}
                    />
                    <span className="text-[13px] text-white/90">
                      Estrada Principal
                    </span>
                  </div>
                </div>

              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">

                <span className="text-[13px] font-semibold text-white">
                  Total
                </span>

                <span className="text-sm font-bold text-white">
                  {pontosMapa.length}
                </span>

              </div>

            </div>

            {/* ========================================
                MAPA
            ======================================== */}

            <div
              className="
                h-full
                overflow-hidden
                rounded-2xl
                border
                border-[#44475A]
              "
            >

              <MapContainer
                key={
                  location.pathname
                }
                center={[
                  -3.290908,
                  -56.151795,
                ]}
                zoom={16}
                className="h-full w-full"
              >

                {/* SATÉLITE */}

                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  attribution="Google Satellite"
                />

                {/* ========================================
                    ESTRADAS PRINCIPAIS
                ======================================== */}

                <Pane
                  name="estradasPrincipaisPane"
                  style={{ zIndex: 800 }}
                >
                  <GeoJSON
                    data={ESTRADAS_PRINCIPAIS as any}
                    style={() => ({
                      color: "#FF3030",
                      weight: 1.1,
                      opacity: 0.45,
                      lineCap: "round",
                      lineJoin: "round",
                    })}
                  />
                </Pane>

                {/* ========================================
                    UTs
                ======================================== */}

                {utsGeoJson && (
                  <GeoJSON
                    data={utsGeoJson}
                    style={() => ({
                      color:
                        "#00FF00",
                      weight: 2,
                      opacity: 1,
                      fillColor:
                        "#00FF00",
                      fillOpacity:
                        0.05,
                    })}
                  />
                )}

                {/* ========================================
                    UPA 13
                ======================================== */}

                {upa13GeoJson && (
                  <Pane
                    name="upa13Pane"
                    style={{
                      zIndex: 350,
                    }}
                  >

                    <GeoJSON
                      data={
                        upa13GeoJson
                      }
                      style={() => ({
                        color:
                          "#4CAF50",
                        weight: 1.5,
                        opacity: 1,
                        fillColor:
                          "#90EE90",
                        fillOpacity:
                          0.25,
                      })}
                      onEachFeature={(
                        feature,
                        layer
                      ) => {

                        const ut =
                          feature
                            .properties
                            ?.UT ||
                          feature
                            .properties
                            ?.UTS ||
                          "UT";

                        const area =
                          Number(
                            feature
                              .properties
                              ?.AREA ||
                              0
                          );

                        layer.bindPopup(
                          `
                            <div style="min-width: 150px">
                              <strong style="font-size: 16px;">
                                🌲 ${ut}
                              </strong>

                              <br />

                              <span>
                                Área:
                                ${area.toFixed(
                                  2
                                )}
                                ha
                              </span>
                            </div>
                          `
                        );
                      }}
                    />

                  </Pane>
                )}

                {/* ========================================
                    AJUSTAR MAPA
                ======================================== */}

                <AjustarMapa
                  pontos={pontosMapaFiltrados}
                />

                {/* ========================================
                    PONTOS DAS ÁRVORES
                ======================================== */}

                {pontosMapaFiltrados.map(
                  (
                    arvore: any,
                    index: number
                  ) => {

                    let cor =
                      "#EF4444";

                    if (
                      arvore.STATUS ===
                      "ARRASTE"
                    ) {
                      cor =
                        "#FACC15";
                    }

                    if (
                      arvore.STATUS ===
                      "MEDIÇÃO"
                    ) {
                      cor =
                        "#3B82F6";
                    }

                    if (
                      arvore.STATUS ===
                      "JUSTIFICADA"
                    ) {
                      cor =
                        "#A855F7";
                    }

                    const popupConteudo = (
                      <Popup>
                        <div className="min-w-[220px]">

                          <div className="mb-2 border-b pb-2">

                            <strong className="text-base">

                              {arvore.STATUS ===
                                "DERRUBADA" &&
                                "🔴 Derrubada"}

                              {arvore.STATUS ===
                                "ARRASTE" &&
                                "🟡 Arraste"}

                              {arvore.STATUS ===
                                "MEDIÇÃO" &&
                                "🔵 Medição"}

                              {arvore.STATUS ===
                                "JUSTIFICADA" &&
                                "🟣 Justificada"}

                            </strong>

                            {/* DERRUBADA */}

                            {arvore.STATUS ===
                              "DERRUBADA" && (
                              <div>

                                <strong>
                                  Motoserrista:
                                </strong>{" "}

                                <span className="font-normal">
                                  {arvore.MOTOSERRISTA ||
                                    "Não informado"}
                                </span>

                              </div>
                            )}

                            {/* ARRASTE */}

                            {arvore.STATUS ===
                              "ARRASTE" && (
                              <div>

                                <strong>
                                  Skideiro Patio:
                                </strong>{" "}

                                <span className="font-normal">
                                  {arvore.SKIDEIRO_PATIO ||
                                    "Não informado"}
                                </span>

                              </div>
                            )}

                            {/* MEDIÇÃO */}

                            {arvore.STATUS ===
                              "MEDIÇÃO" && (
                              <div>

                                <strong>
                                  Equipe:
                                </strong>{" "}

                                <span className="font-normal">
                                  {arvore.EQUIPE ||
                                    "Não informado"}
                                </span>

                              </div>
                            )}

                          </div>

                          <div className="space-y-1 text-sm">

                            <div>
                              <strong>
                                Árvore:
                              </strong>{" "}
                              {
                                arvore[
                                  "Nº ÁRVORE"
                                ]
                              }
                            </div>

                            <div>
                              <strong>
                                Espécie:
                              </strong>{" "}
                              {arvore.ESPECIE}
                            </div>

                            <div>
                              <strong>
                                CAP:
                              </strong>{" "}
                              {arvore.CAP} cm
                            </div>

                            <div>
                              <strong>
                                UPA:
                              </strong>{" "}
                              {arvore.UPA}
                            </div>

                            <div>
                              <strong>
                                UT:
                              </strong>{" "}
                              {arvore.UT}
                            </div>

                            {/* MOTIVO DA JUSTIFICATIVA */}

                            {arvore.STATUS ===
                              "JUSTIFICADA" && (
                              <div className="mt-2 border-t pt-2">

                                <strong>
                                  Motivo:
                                </strong>{" "}

                                <span className="font-normal">
                                  {arvore.MOTIVO_JUSTIFICATIVA ||
                                    arvore[
                                      "Motivo"
                                    ] ||
                                    "Não informado"}
                                </span>

                              </div>
                            )}

                            {/* VOLUME */}

                            {arvore.STATUS ===
                              "MEDIÇÃO" && (
                              <div className="mt-2 border-t pt-2">

                                <strong>
                                  Volume Comercial:
                                </strong>{" "}

                                {Number(
                                  arvore.VOLUME_TOTAL ||
                                    0
                                ).toFixed(2)}{" "}
                                m³

                              </div>
                            )}

                          </div>

                        </div>
                      </Popup>
                    );

                    return (
                      <CircleMarker
                        key={index}
                        center={[
                          Number(
                            arvore.LATITUDE
                          ),
                          Number(
                            arvore.LONGITUDE
                          ),
                        ]}
                        radius={2}
                        pathOptions={{
                          color:
                            "#FFFFFF",
                          weight: 0.7,
                          fillColor:
                            cor,
                          fillOpacity: 0.95,
                        }}
                      >
                        {popupConteudo}
                      </CircleMarker>
                    );
                  }
                )}

              </MapContainer>

            </div>

          </div>

        </Container>
      </div>
    </MainLayout>
  );
}