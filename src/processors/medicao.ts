export interface MedicaoStats {
  volumeFlorestal: number;
  volumeComercial: number;
  arvores: number;
  especies: number;
  dias: number;
  uts: number;
  mediaArvore: number;
}


export function processarMedicao(medicao: any[]) {

  console.log("Primeira linha da medição:", medicao[0]);


  return medicao.map((row) => {

    const volumeFlorestal = Number(
      String(row["Florestal M3"] ?? 0)
        .replace(",", ".")
    );


    const volumeComercial = Number(
      String(row["Comercial M3"] ?? 0)
        .replace(",", ".")
    );


    const arvores = Number(
      row["qtd a"] ?? 0
    );


    return {

      especie:
        row["Espécie"] ??
        row["ESPÉCIE"] ??
        "",


      // SOMENTE DEMONSTRATIVO
      volumeFlorestal,


      // BASE DA MÉDIA E ESTIMATIVA
      volumeComercial,


      // ÁRVORES MEDIDAS
      arvores,


      data:
        row["Data"] ??
        "",


      ut:
        row["UT Inventário"] ??
        "",

    };

  });

}



export function calcularStatsMedicao(
  registros: any[]
): MedicaoStats {


  let volumeFlorestal = 0;

  let volumeComercial = 0;

  let arvores = 0;


  const especies = new Set<string>();

  const dias = new Set<string>();

  const uts = new Set<string>();



  registros.forEach((row) => {


    volumeFlorestal += row.volumeFlorestal;

    volumeComercial += row.volumeComercial;

    arvores += row.arvores;



    if (row.especie) {
      especies.add(row.especie);
    }


    if (row.data) {
      dias.add(row.data);
    }


    if (row.ut) {
      uts.add(row.ut);
    }


  });



  return {

    volumeFlorestal,

    volumeComercial,

    arvores,

    especies: especies.size,

    dias: dias.size,

    uts: uts.size,


    // COMERCIAL / ÁRVORES
    mediaArvore:
      arvores > 0
        ? volumeComercial / arvores
        : 0,

  };

}