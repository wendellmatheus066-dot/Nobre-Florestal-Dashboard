import { supabase } from "../lib/supabase";


export async function salvarPlanilha(
  tabela: string,
  dados: any[]
) {


  try {


    console.log(
      "Importando tabela:",
      tabela
    );


    console.log(
      "Quantidade:",
      dados.length
    );



    // INVENTÁRIO é muito grande
    // não tenta apagar 350 mil registros de uma vez
    if(tabela !== "inventario"){


      const { error: deleteError } =
        await supabase
        .from(tabela)
        .delete()
        .neq(
          "id",
          0
        );


      if(deleteError){

        console.error(
          "Erro limpando tabela:",
          deleteError
        );

        throw deleteError;

      }


    } else {


      console.log(
        "Inventário: mantendo dados existentes para evitar timeout"
      );


    }






    const tamanhoLote = 100;



    for(
      let i = 0;
      i < dados.length;
      i += tamanhoLote
    ){



      const lote = dados
      .slice(
        i,
        i + tamanhoLote
      )
      .map(
        (linha)=>({

          dados:linha

        })
      );





      const { error } =
      await supabase
      .from(tabela)
      .insert(lote);





      if(error){


        console.error(
          "Erro inserindo lote:",
          error
        );


        throw error;


      }



      console.log(
        `${tabela}: enviado ${i + lote.length}/${dados.length}`
      );




      // pequena pausa
      await new Promise(
        resolve =>
        setTimeout(
          resolve,
          100
        )
      );



    }




    console.log(
      "IMPORTAÇÃO FINALIZADA:",
      tabela
    );



    return true;



  } catch(error){


    console.error(
      "ERRO IMPORTAÇÃO:",
      error
    );


    throw error;


  }


}