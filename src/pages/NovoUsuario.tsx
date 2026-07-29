import { supabase } from "../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

export default function NovoUsuario() {
  const navigate = useNavigate();

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("Funcionário");
  const [ativo, setAtivo] = useState(true);

  async function salvarUsuario(e: React.FormEvent) {
  e.preventDefault();

  try {
    const { data, error } = await supabase.functions.invoke(
      "criar-usuario",
      {
        body: {
          nome,
          email,
          senha,
          perfil,
          ativo,
        },
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    if (!data?.sucesso) {
      alert(data?.mensagem ?? "Erro ao criar usuário.");
      return;
    }

    alert("Usuário criado com sucesso!");

    navigate("/admin/usuarios");
  } catch (err) {
    console.error(err);
    alert("Erro ao criar usuário.");
  }
}

  return (
    <MainLayout>

      <div className="mx-auto w-full max-w-5xl px-8 py-8">

        <button
          onClick={() => navigate("/admin/usuarios")}
          className="mb-6 flex items-center gap-2 text-[#8BE9FD] hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="rounded-3xl border border-[#44475A] bg-[#343746] p-10">

          <h1 className="text-4xl font-black text-white">
            Novo Usuário
          </h1>

          <p className="mt-2 text-[#BDC1D6]">
            Cadastre um novo usuário para acessar o sistema.
          </p>

          <form
            onSubmit={salvarUsuario}
            className="mt-10 space-y-8"
          >
                        <div className="grid gap-8 md:grid-cols-2">

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <User size={18} />
                  Nome Completo
                </label>

                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome completo"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#44475A]
                    bg-[#282A36]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#50FA7B]
                  "
                  required
                />

              </div>

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Mail size={18} />
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@nobreflorestal.com"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#44475A]
                    bg-[#282A36]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#50FA7B]
                  "
                  required
                />

              </div>

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Lock size={18} />
                  Senha
                </label>

                <div className="relative">

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite uma senha"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[#44475A]
                      bg-[#282A36]
                      px-4
                      py-3
                      pr-12
                      text-white
                      outline-none
                      focus:border-[#50FA7B]
                    "
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#8BE9FD]
                    "
                  >
                    {mostrarSenha ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Shield size={18} />
                  Perfil
                </label>

                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#44475A]
                    bg-[#282A36]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#50FA7B]
                  "
                >
                  <option>Administrador</option>
                  <option>Manejo</option>
                  <option>Funcionário</option>
                </select>

              </div>

            </div>

            <div className="rounded-2xl border border-[#44475A] bg-[#282A36] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-white">
                    Status do Usuário
                  </h3>

                  <p className="text-sm text-[#BDC1D6]">
                    Defina se o usuário poderá acessar o sistema.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setAtivo(!ativo)}
                  className={`
                    relative
                    h-8
                    w-16
                    rounded-full
                    transition
                    ${ativo ? "bg-green-500" : "bg-red-500"}
                  `}
                >
                  <span
                    className={`
                      absolute
                      top-1
                      h-6
                      w-6
                      rounded-full
                      bg-white
                      transition-all
                      ${ativo ? "left-9" : "left-1"}
                    `}
                  />
                </button>

              </div>

              <p className="mt-4 text-lg font-bold">

                <span className={ativo ? "text-green-400" : "text-red-400"}>
                  {ativo ? "Usuário Ativo" : "Usuário Inativo"}
                </span>

              </p>

            </div>
                        <div className="flex justify-end gap-4 pt-4">

              <button
                type="button"
                onClick={() => navigate("/admin/usuarios")}
                className="
                  rounded-2xl
                  border
                  border-[#44475A]
                  px-8
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#44475A]
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-[#50FA7B]
                  px-8
                  py-3
                  font-bold
                  text-[#282A36]
                  transition
                  hover:scale-105
                  hover:shadow-lg
                "
              >
                💾 Salvar Usuário
              </button>

            </div>

          </form>

        </div>

      </div>

    </MainLayout>
  );
}