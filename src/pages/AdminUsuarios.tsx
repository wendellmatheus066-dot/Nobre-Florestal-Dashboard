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
import { excluirUsuario } from "../services/excluirUsuario";

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

  async function remover(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este usuário?"
    );

    if (!confirmar) return;

    try {
      await excluirUsuario(id);

      setUsuarios((lista) =>
        lista.filter((u) => u.id !== id)
      );

      alert("Usuário excluído com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir usuário.");
    }
  }

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

      <div className="mx-auto w-full max-w-[1750px] space-y-8">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <h1 className="text-4xl font-black tracking-tight text-white">
              Gerenciamento de Usuários
            </h1>

            <p className="mt-3 max-w-2xl text-base text-[#BDC1D6]">
              Cadastre, edite e gerencie todos os usuários do sistema.
            </p>

          </div>

          <button
            onClick={() => navigate("/admin/usuarios/novo")}
            className="
              inline-flex
              h-14
              items-center
              justify-center
              gap-3
              rounded-2xl
              bg-[#50FA7B]
              px-8
              font-bold
              text-[#282A36]
              shadow-lg
              transition-all
              duration-300
              hover:scale-[1.02]
              hover:shadow-[0_0_30px_rgba(80,250,123,0.35)]
            "
          >
            <Plus size={22} />
            Novo Usuário
          </button>

        </div>

        {/* Cards */}
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">

          {/* Card Total */}
          <div className="rounded-3xl border border-[#44475A] bg-[#343746] p-8 shadow-xl">

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#50FA7B]/15">

                <Users
                  size={34}
                  className="text-[#50FA7B]"
                />

              </div>

              <div>

                <p className="text-sm uppercase tracking-wider text-[#BDC1D6]">
                  Total de Usuários
                </p>

                <h2 className="mt-1 text-4xl font-black text-white">
                  {usuariosFiltrados.length}
                </h2>

              </div>

            </div>

          </div>

          {/* Pesquisa */}
          <div className="rounded-3xl border border-[#44475A] bg-[#343746] p-6 shadow-xl">

            <div className="relative">

              <Search
                size={22}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6272A4]"
              />

              <input
                type="text"
                placeholder="Pesquisar por nome, e-mail ou perfil..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-[#44475A]
                  bg-[#282A36]
                  pl-14
                  pr-5
                  text-white
                  placeholder:text-[#6272A4]
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#50FA7B]
                  focus:ring-2
                  focus:ring-[#50FA7B]/20
                "
              />

            </div>

          </div>

        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-3xl border border-[#44475A] bg-[#343746] shadow-xl">
          {loading ? (

  <div className="flex h-72 items-center justify-center">

    <div className="text-center">

      <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#44475A] border-t-[#50FA7B]" />

      <p className="text-lg font-medium text-[#BDC1D6]">
        Carregando usuários...
      </p>

    </div>

  </div>

) : (

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="border-b border-[#44475A] bg-[#2F3140]">

        <tr>

          <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-[#BDC1D6]">
            Nome
          </th>

          <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-[#BDC1D6]">
            E-mail
          </th>

          <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-[#BDC1D6]">
            Perfil
          </th>

          <th className="px-8 py-5 text-center text-sm font-bold uppercase tracking-wider text-[#BDC1D6]">
            Status
          </th>

          <th className="w-44 px-8 py-5 text-center text-sm font-bold uppercase tracking-wider text-[#BDC1D6]">
            Ações
          </th>

        </tr>

      </thead>

      <tbody>

        {usuariosFiltrados.map((usuario) => (

          <tr
            key={usuario.id}
            className="
              border-b
              border-[#44475A]
              transition-all
              duration-200
              hover:bg-[#3A3D4F]
            "
          >

            <td className="px-8 py-6">

              <div className="flex flex-col">

                <span className="text-[15px] font-bold text-white">
                  {usuario.nome}
                </span>

              </div>

            </td>

            <td className="px-8 py-6 text-[#BDC1D6]">
              {usuario.email}
            </td>

            <td className="px-8 py-6">

              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-cyan-500/15
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-cyan-300
                "
              >
                {usuario.perfil}
              </span>

            </td>

            <td className="px-8 py-6 text-center">

              {usuario.ativo ? (

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-green-500/15
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-green-400
                  "
                >
                  Ativo
                </span>

              ) : (

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-red-500/15
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-red-400
                  "
                >
                  Inativo
                </span>

              )}

            </td>

            <td className="px-8 py-6">

              <div className="flex items-center justify-center gap-4">

                <button
                  onClick={() =>
                    navigate(`/admin/usuarios/${usuario.id}`)
                  }
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/15
                    text-blue-400
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:bg-blue-500
                    hover:text-white
                  "
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => remover(usuario.id)}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-500/15
                    text-red-400
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:bg-red-500
                    hover:text-white
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

  </div>

)}
        {!loading && usuariosFiltrados.length === 0 && (

          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">

            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#282A36] border border-[#44475A]">

              <Users
                size={46}
                className="text-[#6272A4]"
              />

            </div>

            <h3 className="text-2xl font-bold text-white">
              Nenhum usuário encontrado
            </h3>

            <p className="mt-3 max-w-md text-[#BDC1D6] leading-relaxed">
              Não encontramos nenhum usuário com os filtros informados.
              Tente pesquisar por outro nome, e-mail ou perfil.
            </p>

            <button
              onClick={() => setPesquisa("")}
              className="
                mt-8
                rounded-2xl
                border
                border-[#44475A]
                bg-[#282A36]
                px-6
                py-3
                font-semibold
                text-white
                transition-all
                duration-300
                hover:border-[#50FA7B]
                hover:text-[#50FA7B]
              "
            >
              Limpar Pesquisa
            </button>

          </div>

                )}

      </div> {/* Fecha a Tabela */}

    </div> {/* Fecha o container principal */}

    </MainLayout>

  );

}