import { useMemo, useState } from "react";

interface EstimativaEspecie {
  especie: string;
  arvores: number;
  arvoresMedidas: number;
  volumeComercial: number;
  volumeFlorestal: number;
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
    (total, esp) => total + Number(esp.arvores ?? 0),
    0
  );

  const totalArvoresMedidas = especies.reduce(
    (total, esp) => total + Number(esp.arvoresMedidas ?? 0),
    0
  );

  const totalVolumeComercial = especies.reduce(
    (total, esp) => total + Number(esp.volumeComercial ?? 0),
    0
  );

  const totalVolumeFlorestal = especies.reduce(
    (total, esp) => total + Number(esp.volumeFlorestal ?? 0),
    0
  );

  const volumeEstimado = especies.reduce(
    (total, esp) =>
      total +
      Number(esp.arvores ?? 0) *
        Number(esp.mediaArvore ?? 0),
    0
  );

  return (
    <div
      className="
        w-full
        max-w-7xl
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
          <h2 className="text-xl font-bold text-white">
            Estimativa de Volume
          </h2>

          <p className="text-sm text-gray-400">
            Árvores derrubadas e volume estimado por espécie
          </p>
        </div>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
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
          overflow-x-auto
          rounded-xl
          border
          border-[#44475A]
        "
      >
        <table
          className="
            min-w-full
            bg-[#282A36]
            text-sm
          "
        >
          <thead>
            <tr className="bg-[#1B4332] text-white">
              <th className="px-4 py-3 text-left">
                Espécie
              </th>

              <th className="px-4 py-3 text-center">
                Árvores Derrubadas
              </th>

              <th className="px-4 py-3 text-center">
                Árvores Medidas
              </th>

              <th className="px-4 py-3 text-center">
                Volume Comercial
              </th>

              <th className="px-4 py-3 text-center">
                Volume Florestal
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
            {especiesFiltradas.map((esp) => (
              <tr
                key={esp.especie}
                className="
                  border-b
                  border-[#44475A]
                  hover:bg-[#343746]
                  transition
                "
              >
                <td className="px-4 py-2 text-gray-100 font-medium">
                  {esp.especie}
                </td>

                <td className="text-center font-semibold text-white">
                  {esp.arvores}
                </td>

                <td className="text-center text-cyan-400 font-semibold">
                  {esp.arvoresMedidas}
                </td>

                <td className="text-center text-green-400 font-semibold">
                  {esp.volumeComercial.toFixed(2)} m³
                </td>

                <td className="text-center text-yellow-400 font-semibold">
                  {esp.volumeFlorestal.toFixed(2)} m³
                </td>

                <td className="text-center text-gray-300">
                  {esp.mediaArvore.toFixed(3)}
                </td>

                <td className="text-center font-bold text-[#52B788]">
                  {(esp.arvores * esp.mediaArvore).toFixed(2)} m³
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
          grid-cols-2
          lg:grid-cols-5
          gap-4
        "
      >
        <div className="rounded-xl bg-[#21222C] border border-[#44475A] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Árvores Derrubadas
          </p>

          <h3 className="text-3xl font-bold text-white mt-2">
            {totalArvores}
          </h3>
        </div>

        <div className="rounded-xl bg-[#21222C] border border-[#44475A] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Árvores Medidas
          </p>

          <h3 className="text-3xl font-bold text-cyan-400 mt-2">
            {totalArvoresMedidas}
          </h3>
        </div>

        <div className="rounded-xl bg-[#21222C] border border-[#44475A] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Volume Comercial
          </p>

          <h3 className="text-3xl font-bold text-green-400 mt-2">
            {totalVolumeComercial.toFixed(2)} m³
          </h3>
        </div>

        <div className="rounded-xl bg-[#21222C] border border-[#44475A] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Volume Florestal
          </p>

          <h3 className="text-3xl font-bold text-yellow-400 mt-2">
            {totalVolumeFlorestal.toFixed(2)} m³
          </h3>
        </div>

        <div className="rounded-xl bg-[#21222C] border border-[#44475A] p-4 text-center">
          <p className="text-gray-400 text-sm">
            Volume Estimado
          </p>

          <h3 className="text-3xl font-bold text-[#52B788] mt-2">
            {volumeEstimado.toFixed(2)} m³
          </h3>
        </div>
      </div>
    </div>
  );
}