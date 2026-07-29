import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";

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
  const { data } = useExcelContext();

  const producao = data["PRODUÇÃO"] || [];
  const arraste = data["ARRASTE"] || [];
  const medicao = data["MEDIÇÃO"] || [];
  const inventario = data["INVENTÁRIO"] || [];

  function limparNumero(valor: any) {
    if (valor === undefined || valor === null) return "";

    return String(valor).replace(".0", "").trim();
  }

  const mapaInventario = new Map();

  inventario.forEach((arvore: any) => {
    const numero = limparNumero(arvore["Nº ÁRVORE"]);

    if (numero) {
      mapaInventario.set(numero, arvore);
    }
  });

  const mapaArvores = new Map();

  // 🔴 DERRUBADA
  producao.forEach((arvore: any) => {
    const numero = limparNumero(arvore["Nº ÁRVORE"]);

    mapaArvores.set(numero, {
      ...arvore,
      STATUS: "DERRUBADA",
    });
  });

  // 🟡 ARRASTE
  arraste.forEach((arvore: any) => {
    const numero = limparNumero(arvore["Nº ÁRVORE"]);

    mapaArvores.set(numero, {
      ...arvore,
      STATUS: "ARRASTE",
    });
  });

  // 🔵 MEDIÇÃO
  medicao.forEach((arvore: any) => {
    const numero = limparNumero(arvore["Nº ÁRVORE"]);

    mapaArvores.set(numero, {
      ...arvore,
      STATUS: "MEDIÇÃO",
    });
  });

  const pontosMapa: any[] = [];

  mapaArvores.forEach((arvore: any) => {
    const numero = limparNumero(arvore["Nº ÁRVORE"]);

    const dadosInventario = mapaInventario.get(numero);

    if (!dadosInventario) {
      console.log("Não encontrou no inventário:", numero);
      return;
    }

    pontosMapa.push({
      ...arvore,
      LATITUDE: dadosInventario.LATITUDE,
      LONGITUDE: dadosInventario.LONGITUDE,
      ESPECIE: dadosInventario["NOME COMUM"],
      CAP: dadosInventario["CAP (CM)"],
      UPA: dadosInventario.UPA,
      UT: dadosInventario["Nº UT"],
      VOLUME_TOTAL:
              Number(arvore["COMERCIAL M3"]) || 0,
    });
  });

  console.log("PONTOS MAPA:", pontosMapa);

  return (
    <MainLayout>
      <div className="pt-8 w-full">
        <Container>
          <Header
            title="Mapa Operacional"
            subtitle="Derrubada • Arraste • Medição"
          />

          <div className="h-6" />

          <div
            className="
              relative
              z-0
              h-[600px]
              rounded-2xl
              overflow-hidden
              border
              border-[#44475A]
            "
          >
            <MapContainer
              center={[
                -3.290908,
                -56.151795,
              ]}
              zoom={16}
              className="h-full w-full"
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution="Google Satellite"
              />

              <AjustarMapa pontos={pontosMapa} />

              {pontosMapa.map((arvore: any, index: number) => {
                let cor = "#ff0000";

                if (arvore.STATUS === "ARRASTE") {
                  cor = "#ffd000";
                }

                if (arvore.STATUS === "MEDIÇÃO") {
                  cor = "#008cff";
                }

                return (
                  <CircleMarker
                    key={index}
                    center={[
                      Number(arvore.LATITUDE),
                      Number(arvore.LONGITUDE),
                    ]}
                    radius={2}
                    pathOptions={{
                      color: cor,
                      fillColor: cor,
                      fillOpacity: 1,
                    }}
                  >
                    <Popup>
                      <div>
                        <strong>
                          {arvore.STATUS === "DERRUBADA" && "🔴 DERRUBADA"}
                          {arvore.STATUS === "ARRASTE" && "🟡 ARRASTE"}
                          {arvore.STATUS === "MEDIÇÃO" && "🔵 MEDIÇÃO"}
                        </strong>

                        <br />
                        <br />

                        Árvore: {arvore["Nº ÁRVORE"]}

                        <br />

                        Espécie: {arvore.ESPECIE}

                        <br />

                        CAP: {arvore.CAP}

                        <br />

                        UPA: {arvore.UPA}

                        <br />

                        UT: {arvore.UT}
                                                {arvore.STATUS === "MEDIÇÃO" && (
                          <>
                            <br />
                            <br />

                            Volume Comercial:{" "}
                            {arvore.VOLUME_TOTAL.toFixed(2)} m³
                          </>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}