import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { supabase } from "../lib/supabase";

export default function EditarUsuario() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Usuário não encontrado.");
        navigate("/admin/usuarios");
        return;
      }

      setNome(data.nome);
      setEmail(data.email);
      setPerfil(data.perfil);
      setAtivo(data.ativo);

      setLoading(false);
    }

    carregar();
  }, [id, navigate]);
  async function salvar() {
  const { error } = await supabase
    .from("usuarios")
    .update({
      nome,
      email,
      perfil,
      ativo,
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar usuário.");
    console.error(error);
    return;
  }

  alert("Usuário atualizado com sucesso!");

  navigate("/admin/usuarios");
}

if (loading) {
  return (
    <MainLayout>
      <div className="p-10 text-center text-white">
        Carregando...
      </div>
    </MainLayout>
  );
}

return (
  <MainLayout>

    <div className="mx-auto max-w-3xl px-8 py-8">

      <h1 className="mb-8 text-4xl font-black text-white">
        Editar Usuário
      </h1>

      <div className="rounded-3xl border border-[#44475A] bg-[#343746] p-8">

        <label className="mb-2 block text-white">
          Nome
        </label>

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mb-6 w-full rounded-2xl bg-[#282A36] p-4 text-white"
        />

        <label className="mb-2 block text-white">
          E-mail
        </label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full rounded-2xl bg-[#282A36] p-4 text-white"
        />

        <label className="mb-2 block text-white">
          Perfil
        </label>

        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
          className="mb-6 w-full rounded-2xl bg-[#282A36] p-4 text-white"
        >
          <option>Administrador</option>
          <option>Funcionário</option>
          <option>Manejo</option>
        </select>
                <label className="mb-2 block text-white">
          Status
        </label>

        <select
          value={ativo ? "true" : "false"}
          onChange={(e) => setAtivo(e.target.value === "true")}
          className="mb-8 w-full rounded-2xl bg-[#282A36] p-4 text-white"
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <div className="flex gap-4">

          <button
            onClick={salvar}
            className="
              flex-1
              rounded-2xl
              bg-[#50FA7B]
              py-4
              font-bold
              text-[#282A36]
              hover:opacity-90
            "
          >
            Salvar Alterações
          </button>

          <button
            onClick={() => navigate("/admin/usuarios")}
            className="
              flex-1
              rounded-2xl
              bg-red-500
              py-4
              font-bold
              text-white
              hover:bg-red-600
            "
          >
            Cancelar
          </button>

        </div>

      </div>

    </div>

  </MainLayout>
);

}