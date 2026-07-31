import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";

import { ArrowLeft } from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";

import { useExcelContext } from "../context/ExcelContext";

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

export default function MapaFlorestal() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fecha automaticamente o mapa quando o Safari
  // vai para segundo plano (corrige o bug do iPhone)
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

  const { data } = useExcelContext();

  const producao = data["PRODUÇÃO"] || [];
  const arraste = data["ARRASTE"] || [];
  const medicao = data["MEDIÇÃO"] || [];
  const inventario = data["INVENTÁRIO"] || [];

  function limparNumero(valor: any) {
    if (!valor) return "";

    return String(valor)
      .replace(".0", "")
      .trim();
  }

  const mapaInventario = new Map();

  inventario.forEach((arvore: any) => {
    const numero = limparNumero(
      arvore["Nº ÁRVORE"]
    );

    if (numero) {
      mapaInventario.set(numero, arvore);
    }
  });

  const mapaArvores = new Map();

  producao.forEach((arvore: any) => {
    mapaArvores.set(
      limparNumero(arvore["Nº ÁRVORE"]),
      {
        ...arvore,
        STATUS: "DERRUBADA",
      }
    );
  });

  arraste.forEach((arvore: any) => {
    mapaArvores.set(
      limparNumero(arvore["Nº ÁRVORE"]),
      {
        ...arvore,
        STATUS: "ARRASTE",
      }
    );
  });

  medicao.forEach((arvore: any) => {
    mapaArvores.set(
      limparNumero(arvore["Nº ÁRVORE"]),
      {
        ...arvore,
        STATUS: "MEDIÇÃO",
      }
    );
  });

  const pontosMapa: any[] = [];

  mapaArvores.forEach((arvore: any) => {
    const dadosInventario =
      mapaInventario.get(
        limparNumero(
          arvore["Nº ÁRVORE"]
        )
      );

    if (!dadosInventario) return;

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
      UPA: dadosInventario.UPA,
      UT: dadosInventario["Nº UT"],
      VOLUME_TOTAL:
        Number(
          arvore["COMERCIAL M3"]
        ) || 0,
    });
  });

  const totalDerrubada =
    pontosMapa.filter(
      (p) =>
        p.STATUS === "DERRUBADA"
    ).length;

  const totalArraste =
    pontosMapa.filter(
      (p) =>
        p.STATUS === "ARRASTE"
    ).length;

  const totalMedicao =
    pontosMapa.filter(
      (p) =>
        p.STATUS === "MEDIÇÃO"
    ).length;

  return (
    <MainLayout>
      <div className="pt-8 w-full">
        <Container>

          <Header
            title="Mapa Operacional"
            subtitle="Derrubada • Arraste • Medição"
          />

          <div className="h-6" />

          <div className="relative h-[600px]">

            <button
              onClick={() => navigate(-1)}
              style={{ zIndex: 99999 }}
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
              <ArrowLeft size={24} />
            </button>

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

              <div className="space-y-2 px-3 py-2">

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

              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">

                <span className="text-[13px] font-semibold text-white">
                  Total
                </span>

                <span className="text-sm font-bold text-white">
                  {pontosMapa.length}
                </span>

              </div>

            </div>

            <div className="h-full overflow-hidden rounded-2xl border border-[#44475A]">

              <MapContainer
  key={location.pathname}
  center={[-3.290908, -56.151795]}
  zoom={16}
  className="h-full w-full"
>

                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  attribution="Google Satellite"
                />

                <AjustarMapa pontos={pontosMapa} />

                {pontosMapa.map((arvore: any, index: number) => {

                  let cor = "#EF4444";

                  if (arvore.STATUS === "ARRASTE") {
                    cor = "#FACC15";
                  }

                  if (arvore.STATUS === "MEDIÇÃO") {
                    cor = "#3B82F6";
                  }

                  return (

                    <CircleMarker
                      key={index}
                      center={[
                        Number(arvore.LATITUDE),
                        Number(arvore.LONGITUDE),
                      ]}
                      radius={3}
                      pathOptions={{
                        color: "#FFFFFF",
                        weight: 1,
                        fillColor: cor,
                        fillOpacity: 1,
                      }}
                    >

                      <Popup>

                        <div className="min-w-[220px]">

                          <div className="mb-2 border-b pb-2">

                            <strong className="text-base">
                              {arvore.STATUS === "DERRUBADA" && "🔴 Derrubada"}
                              {arvore.STATUS === "ARRASTE" && "🟡 Arraste"}
                              {arvore.STATUS === "MEDIÇÃO" && "🔵 Medição"}
                            </strong>

                          </div>

                          <div className="space-y-1 text-sm">

                            <div>
                              <strong>Árvore:</strong>{" "}
                              {arvore["Nº ÁRVORE"]}
                            </div>

                            <div>
                              <strong>Espécie:</strong>{" "}
                              {arvore.ESPECIE}
                            </div>

                            <div>
                              <strong>CAP:</strong>{" "}
                              {arvore.CAP} cm
                            </div>

                            <div>
                              <strong>UPA:</strong>{" "}
                              {arvore.UPA}
                            </div>

                            <div>
                              <strong>UT:</strong>{" "}
                              {arvore.UT}
                            </div>

                            {arvore.STATUS === "MEDIÇÃO" && (

                              <div className="mt-2 border-t pt-2">

                                <strong>Volume Comercial:</strong>{" "}
                                {arvore.VOLUME_TOTAL.toFixed(2)} m³

                              </div>

                            )}

                          </div>

                        </div>

                      </Popup>

                    </CircleMarker>

                  );

                })}

              </MapContainer>

            </div>

          </div>

        </Container>

      </div>

    </MainLayout>

  );

}