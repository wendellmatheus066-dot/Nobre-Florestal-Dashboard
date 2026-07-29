export interface ArvoreMapa {

  numero: string;

  especie: string;

  ut: string;

  coordenadaX: number;

  coordenadaY: number;

  cap: number;

  categoria: string;

  volumeEstimado: number;

  status:
    | "inventario"
    | "derruba"
    | "arraste"
    | "medicao";

}



export function processarInventario(
  inventario: any[]
): ArvoreMapa[] {


  return inventario.map((row) => ({


    numero:
      String(
        row["Nr. Árvore"] ??
        row["Nr Árvore"] ??
        row["Numero"] ??
        ""
      ),



    especie:
      row["Espécie"] ??
      "",



    ut:
      String(
        row["UT"] ??
        ""
      ),



    coordenadaX:
      Number(
        String(
          row["COORDENADA X"] ?? 0
        )
        .replace(",", ".")
      ),



    coordenadaY:
      Number(
        String(
          row["COORDENADA Y"] ?? 0
        )
        .replace(",", ".")
      ),



    cap:
      Number(
        String(
          row["CAP"] ?? 0
        )
        .replace(",", ".")
      ),



    categoria:
      row["CATEGORIA"] ??
      "",



    volumeEstimado:
      Number(
        String(
          row["VOLUME ESTIMADO"] ?? 0
        )
        .replace(",", ".")
      ),



    status:
      "inventario",



  }));

}