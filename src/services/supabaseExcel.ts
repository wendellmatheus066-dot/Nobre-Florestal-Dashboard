import { supabase } from "../lib/supabase";



function limparNumero(valor:any){

  if(valor === undefined || valor === null){

    return "";

  }


  return String(valor)
    .replace(".0","")
    .trim();

}








async function buscarTabelaSupabase(
  tabela:string
){


  const todos:any[] = [];

  const tamanho = 1000;

  let inicio = 0;



  try{


    while(true){



      const { data, error } =

        await supabase

          .from(tabela)

          .select("*")

          .order(
            "id",
            {
              ascending:true
            }
          )

          .range(
            inicio,
            inicio + tamanho - 1
          );




      if(error){

        throw error;

      }




      if(!data || data.length === 0){

        break;

      }




      todos.push(...data);




      console.log(
        `${tabela} página ${inicio}:`,
        data.length
      );




      if(data.length < tamanho){

        break;

      }




      inicio += tamanho;


    }




    console.log(
      `${tabela} TOTAL:`,
      todos.length
    );




    return todos.map(

      item => item.dados

    );




  }catch(error){


    console.error(
      `Erro buscando ${tabela}:`,
      error
    );


    return [];

  }


}









// BUSCA INVENTÁRIO NECESSÁRIO

async function buscarInventarioFiltrado(

  numeros:string[]

){



  if(numeros.length === 0){

    return [];

  }



  try{


    console.log(
      "Buscando inventário..."
    );




    const todos:any[] = [];

    const tamanho = 1000;

    let inicio = 0;






    while(true){



      const { data, error } =

        await supabase

          .from("inventario")

          .select("*")

          .order(
            "id",
            {
              ascending:true
            }
          )

          .range(
            inicio,
            inicio + tamanho - 1
          );





      if(error){

        throw error;

      }




      if(!data || data.length === 0){

        break;

      }




      todos.push(...data);




      console.log(
        `inventario página ${inicio}:`,
        data.length
      );




      if(data.length < tamanho){

        break;

      }




      inicio += tamanho;


    }






    console.log(
      "TOTAL INVENTARIO BUSCADO:",
      todos.length
    );






    const numerosLimpos = numeros.map(

      numero => limparNumero(numero)

    );






    const filtrado = todos.filter(

      item => {


        const dados = item.dados || {};



        const numeroInventario = limparNumero(

          dados["Nº ÁRVORE"]

        );



        return numerosLimpos.includes(

          numeroInventario

        );


      }

    );







    console.log(

      "INVENTÁRIO ENCONTRADO:",

      filtrado.length

    );







    return filtrado.map(

      item => item.dados

    );





  }catch(error){



    console.error(

      "Erro inventário:",

      error

    );


    return [];


  }



}









export async function buscarProducaoSupabase(){


  return buscarTabelaSupabase(

    "producao"

  );


}







export async function buscarArrasteSupabase(){


  return buscarTabelaSupabase(

    "arraste"

  );


}







export async function buscarMedicaoSupabase(){


  return buscarTabelaSupabase(

    "medicao"

  );


}







export async function buscarInventarioSupabase(

  numeros:string[] = []

){



  if(numeros.length > 0){


    return buscarInventarioFiltrado(

      numeros

    );


  }




  return buscarTabelaSupabase(

    "inventario"

  );


}