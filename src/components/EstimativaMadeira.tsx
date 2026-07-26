import { useMemo, useState } from "react";

interface EstimativaEspecie {
  especie: string;
  arvores: number;
  volumeComercial: number;
  mediaArvore: number;
}

interface Props {
  especies: EstimativaEspecie[];
}

export default function EstimativaMadeira({
  especies,
}: Props) {

  const [busca, setBusca] = useState("");

  const especiesFiltradas = useMemo(() => {

    return especies.filter((e) =>
      String(e.especie ?? "")
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

  }, [especies, busca]);


  const totalArvores = especies.reduce(
    (total, esp) =>
      total + Number(esp.arvores ?? 0),
    0
  );


  const volumeTotal = especies.reduce(
    (total, esp) =>
      total +
      (
        Number(esp.arvores ?? 0) *
        Number(esp.mediaArvore ?? 0)
      ),
    0
  );


  return (

    <div
      className="
        w-full
        max-w-5xl
        mx-auto
        bg-[#343746]
        rounded-2xl
        shadow-xl
        p-6
        border
        border-[#44475A]
      "
    >

      <div
        className="
          flex
          flex-col
          gap-4
          mb-6
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <h2 className="
            text-xl
            font-bold
            text-white
          ">
            Estimativa de Volume
          </h2>

          <p className="
            text-sm
            text-gray-400
          ">
            Árvores derrubadas e volume estimado por espécie
          </p>

        </div>


        <input
          value={busca}
          onChange={(e)=>setBusca(e.target.value)}
          placeholder="Pesquisar espécie..."

          className="
            w-full
            md:w-72
            rounded-xl
            border
            border-[#44475A]
            bg-[#21222C]
            text-white
            placeholder-gray-500
            px-4
            py-2
            text-sm
            outline-none
            focus:ring-2
            focus:ring-[#40916C]
          "
        />

      </div>



      <div
        className="
          w-full
          overflow-auto
          rounded-xl
          border
          border-[#44475A]
        "
      >

        <table
          className="
            w-full
            bg-[#282A36]
            text-sm
          "
        >

          <thead>

            <tr className="
              bg-[#1B4332]
              text-white
            ">

              <th className="px-4 py-3 text-left">
                Espécie
              </th>

              <th className="px-4 py-3 text-center">
                Árvores Derrubadas
              </th>

              <th className="px-4 py-3 text-center">
                Média m³/Árvore
              </th>

              <th className="px-4 py-3 text-center">
                Volume Estimado
              </th>

            </tr>

          </thead>


          <tbody>

            {especiesFiltradas.map((esp)=>(

              <tr
                key={esp.especie}
                className="
                  border-b
                  border-[#44475A]
                  hover:bg-[#343746]
                  transition
                "
              >

                <td className="
                  px-4
                  py-2
                  text-gray-100
                  font-medium
                ">
                  {esp.especie}
                </td>


                <td className="
                  text-center
                  text-gray-200
                  font-semibold
                ">
                  {esp.arvores}
                </td>


                <td className="
                  text-center
                  text-gray-300
                ">
                  {Number(
                    esp.mediaArvore
                  ).toFixed(3)}
                </td>


                <td className="
                  text-center
                  font-bold
                  text-[#52B788]
                ">
                  {(esp.arvores *
                    esp.mediaArvore
                  ).toFixed(2)} m³
                </td>


              </tr>

            ))}

          </tbody>

        </table>

      </div>




      <div
        className="
          mt-6
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        "
      >


        <div
          className="
            rounded-xl
            border
            border-[#44475A]
            bg-[#21222C]
            p-5
            text-center
          "
        >

          <p className="
            text-sm
            text-gray-400
          ">
            Total de Árvores Derrubadas
          </p>


          <h3 className="
            text-4xl
            font-bold
            text-[#52B788]
            mt-2
          ">
            {totalArvores}
          </h3>


        </div>




        <div
          className="
            rounded-xl
            border
            border-[#44475A]
            bg-[#21222C]
            p-5
            text-center
          "
        >

          <p className="
            text-sm
            text-gray-400
          ">
            Volume Estimado
          </p>


          <h3 className="
            text-4xl
            font-bold
            text-[#52B788]
            mt-2
          ">
            {volumeTotal.toFixed(2)} m³
          </h3>


        </div>


      </div>


    </div>

  );
}