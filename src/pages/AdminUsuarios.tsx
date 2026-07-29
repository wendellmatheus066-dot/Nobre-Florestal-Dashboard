import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import { listarUsuarios } from "../services/usuarios";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
};

export default function AdminUsuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const dados = await listarUsuarios();
        setUsuarios(dados || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const texto = pesquisa.toLowerCase();

      return (
        usuario.nome.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto) ||
        usuario.perfil.toLowerCase().includes(texto)
      );
    });
  }, [usuarios, pesquisa]);

  return (
    <MainLayout>

      <div className="mx-auto w-full max-w-7xl px-8 py-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-4xl font-black text-white">
              Gerenciamento de Usuários
            </h1>

            <p className="mt-3 text-[#BDC1D6]">
              Cadastre, edite e gerencie os usuários do sistema.
            </p>

          </div>

          <button
            onClick={() => navigate("/admin/usuarios/novo")}
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-[#50FA7B]
              px-6
              py-4
              font-bold
              text-[#282A36]
              hover:scale-105
              transition
            "
          >

            <Plus size={22} />

            Novo Usuário

          </button>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-[#44475A] bg-[#343746] p-6">

            <div className="flex items-center gap-4">

              <Users
                size={34}
                className="text-[#50FA7B]"
              />

              <div>

                <p className="text-[#BDC1D6]">
                  Total de Usuários
                </p>

                <h2 className="text-4xl font-black text-white">

                  {usuariosFiltrados.length}

                </h2>

              </div>

            </div>

          </div>

          <div className="relative">

            <Search
              size={20}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#6272A4]
              "
            />

            <input
              type="text"
              placeholder="Pesquisar usuário..."
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
              className="
                w-full
                rounded-3xl
                border
                border-[#44475A]
                bg-[#343746]
                py-4
                pl-12
                pr-4
                text-white
                outline-none
              "
            />

          </div>

        </div>
                <div className="mt-8 overflow-hidden rounded-3xl border border-[#44475A] bg-[#343746]">

          {loading ? (

            <div className="p-10 text-center text-white">
              Carregando usuários...
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-[#282A36]">

                <tr>

                  <th className="p-4 text-left text-white">
                    Nome
                  </th>

                  <th className="p-4 text-left text-white">
                    E-mail
                  </th>

                  <th className="p-4 text-left text-white">
                    Perfil
                  </th>

                  <th className="p-4 text-center text-white">
                    Status
                  </th>

                  <th className="p-4 text-center text-white">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {usuariosFiltrados.map((usuario) => (

                  <tr
                    key={usuario.id}
                    className="
                      border-t
                      border-[#44475A]
                      hover:bg-[#3D4052]
                      transition
                    "
                  >

                    <td className="p-4 font-semibold text-white">
                      {usuario.nome}
                    </td>

                    <td className="p-4 text-[#BDC1D6]">
                      {usuario.email}
                    </td>

                    <td className="p-4">

                      <span className="
                        rounded-xl
                        bg-[#8BE9FD]/20
                        px-3
                        py-1
                        text-[#8BE9FD]
                        font-semibold
                      ">

                        {usuario.perfil}

                      </span>

                    </td>

                    <td className="p-4 text-center">

                      {usuario.ativo ? (

                        <span className="
                          rounded-full
                          bg-green-500/20
                          px-3
                          py-1
                          font-bold
                          text-green-400
                        ">
                          Ativo
                        </span>

                      ) : (

                        <span className="
                          rounded-full
                          bg-red-500/20
                          px-3
                          py-1
                          font-bold
                          text-red-400
                        ">
                          Inativo
                        </span>

                      )}

                    </td>

                    <td className="p-4">

                      <div className="
                        flex
                        justify-center
                        gap-3
                      ">

                        <button
                          className="
                            rounded-xl
                            bg-blue-500/20
                            p-2
                            text-blue-400
                            hover:bg-blue-500
                            hover:text-white
                            transition
                          "
                        >

                          <Pencil size={18} />

                        </button>

                        <button
                          className="
                            rounded-xl
                            bg-red-500/20
                            p-2
                            text-red-400
                            hover:bg-red-500
                            hover:text-white
                            transition
                          "
                        >

                          <Trash2 size={18} />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}
                              </tbody>

            </table>

          )}

          {!loading && usuariosFiltrados.length === 0 && (

            <div className="p-10 text-center">

              <Users
                size={52}
                className="mx-auto mb-4 text-[#6272A4]"
              />

              <h3 className="text-2xl font-bold text-white">
                Nenhum usuário encontrado
              </h3>

              <p className="mt-2 text-[#BDC1D6]">
                Tente outro termo na pesquisa.
              </p>

            </div>

          )}

        </div>

      </div>

    </MainLayout>

  );

}