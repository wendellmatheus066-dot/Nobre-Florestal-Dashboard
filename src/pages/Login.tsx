import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, session } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErro("");

    const sucesso = await login(email, password);

    if (sucesso) {
      return;
    }

    setErro("E-mail ou senha inválidos");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#282A36] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#44475A] bg-[#343746] p-8 shadow-2xl"
      >
        <div className="mb-8 flex justify-center">
          <ShieldCheck size={70} className="text-[#50FA7B]" />
        </div>

        <h1 className="mb-8 text-center text-4xl font-bold text-white">
          Administração
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErro("");
          }}
          className="mb-4 h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white outline-none focus:border-[#50FA7B]"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErro("");
          }}
          className="mb-4 h-12 w-full rounded-xl border border-[#44475A] bg-[#282A36] px-4 text-white outline-none focus:border-[#50FA7B]"
        />

        {erro && (
          <p className="mb-4 text-center text-sm text-red-400">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-[#50FA7B] text-lg font-semibold text-[#282A36] transition hover:brightness-110"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}