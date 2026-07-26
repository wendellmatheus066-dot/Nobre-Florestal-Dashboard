import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  LogOut,
  ShieldCheck,
  Database,
  CalendarDays,
  FileSpreadsheet,
  HardDrive,
  UserCheck,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import { useAuth } from "../context/AuthContext";
import { useExcel } from "../hooks/useExcel";

type CardProps = {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  cor: string;
};

function InfoCard({
  icon,
  titulo,
  valor,
  cor,
}: CardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#44475A]
        bg-[#343746]
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
      "
    >
      <div className="mb-5 flex items-center gap-3">
        <div className={cor}>{icon}</div>

        <h2 className="text-lg font-bold text-white">
          {titulo}
        </h2>
      </div>

      <p className="text-lg font-semibold text-[#F8F8F2]">
        {valor}
      </p>
    </div>
  );
}

export default function Admin() {
  const { login, isAdmin, logout } = useAuth();

  const { loadExcel } = useExcel();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);
      function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (login(password)) {
      navigate("/admin");
    } else {
      alert("Senha incorreta!");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setSuccess(false);
  }

  async function handleImport() {
    if (!selectedFile) return;

    try {
      setLoading(true);

      await loadExcel(selectedFile);

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error(error);

      alert("Erro ao importar a planilha.");
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin) {
    return (
      <MainLayout>

  <div className="mx-auto w-full max-w-6xl px-8 py-8">
                  {/* Cabeçalho */}

          <div className="mb-12">

            <p className="text-sm uppercase tracking-[5px] text-[#50FA7B]">
              TRK FLOREST
            </p>

            <h1 className="mt-2 text-4xl font-black text-white">
              Painel Administrativo
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-[#BDC1D6]">
              Gerencie importações de planilhas, acompanhe o status do sistema e mantenha todos os dashboards sincronizados.
            </p>

          </div>

          {/* Cards */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            <InfoCard
              icon={<UserCheck size={26} />}
              titulo="Administrador"
              valor="Wendell"
              cor="text-[#50FA7B]"
            />

            <InfoCard
              icon={<Database size={26} />}
              titulo="Banco"
              valor="Supabase Online"
              cor="text-[#8BE9FD]"
            />

            <InfoCard
              icon={<HardDrive size={26} />}
              titulo="Sistema"
              valor="Operacional"
              cor="text-[#FFB86C]"
            />

            <InfoCard
              icon={<CalendarDays size={26} />}
              titulo="Última atualização"
              valor={selectedFile ? "Agora" : "--"}
              cor="text-[#F1FA8C]"
            />

          </div>

          {/* Status do Sistema */}

          <div className="mt-10 rounded-3xl border border-[#44475A] bg-[#343746] p-8">

            <h2 className="mb-6 text-2xl font-bold text-white">
              Status do Sistema
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div className="rounded-2xl bg-[#282A36] p-5">
                <p className="text-sm text-[#BDC1D6]">Sistema</p>
                <p className="mt-2 text-xl font-bold text-[#50FA7B]">
                  Operacional
                </p>
              </div>

              <div className="rounded-2xl bg-[#282A36] p-5">
                <p className="text-sm text-[#BDC1D6]">Banco de Dados</p>
                <p className="mt-2 text-xl font-bold text-[#8BE9FD]">
                  Supabase Online
                </p>
              </div>

              <div className="rounded-2xl bg-[#282A36] p-5">
                <p className="text-sm text-[#BDC1D6]">
                  Último Arquivo
                </p>

                <p className="mt-2 break-all text-lg font-bold text-white">
                  {selectedFile ? selectedFile.name : "Nenhum"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#282A36] p-5">
                <p className="text-sm text-[#BDC1D6]">
                  Última Importação
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  {selectedFile ? "Agora" : "--"}
                </p>
              </div>

            </div>

          </div>

          {/* Card Principal */}

          <div className="mt-10 rounded-3xl border border-[#44475A] bg-[#343746] p-10 shadow-2xl">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#282A36]">

                <Upload
                  size={34}
                  className="text-[#50FA7B]"
                />

              </div>

              <div>

                <h2 className="text-3xl font-bold text-white">
                  Importação de Planilhas
                </h2>

                <p className="mt-2 text-[#BDC1D6]">
                  Selecione um arquivo Excel para atualizar automaticamente todos os dashboards do sistema.
                </p>

              </div>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-4
                rounded-3xl
                border-2
                border-dashed
                border-[#6272A4]
                bg-[#282A36]
                py-10
                text-xl
                font-bold
                text-white
                transition-all
                hover:border-[#50FA7B]
                hover:bg-[#303343]
              "
            >
              <Upload size={26} />
              Selecionar Planilha Excel
            </button>
                        {selectedFile && (
              <div className="mt-8 rounded-3xl border border-[#44475A] bg-[#282A36] p-8">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#343746]">
                    <FileSpreadsheet
                      size={42}
                      className="text-[#50FA7B]"
                    />
                  </div>

                  <div className="flex-1">

                    <p className="text-sm uppercase tracking-widest text-[#8BE9FD]">
                      Arquivo selecionado
                    </p>

                    <h3 className="mt-2 break-all text-2xl font-bold text-white">
                      {selectedFile.name}
                    </h3>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">

                      <div className="rounded-xl bg-[#343746] p-4">
                        <p className="text-xs uppercase text-[#BDC1D6]">
                          Tamanho
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#50FA7B]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#343746] p-4">
                        <p className="text-xs uppercase text-[#BDC1D6]">
                          Tipo
                        </p>

                        <p className="mt-1 text-lg font-bold text-white">
                          Excel
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#343746] p-4">
                        <p className="text-xs uppercase text-[#BDC1D6]">
                          Status
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#50FA7B]">
                          Pronto para importar
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border border-[#6272A4] bg-[#343746] py-4 text-lg font-bold text-white transition hover:bg-[#44475A]"
                  >
                    Escolher outro arquivo
                  </button>

                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="rounded-2xl bg-[#50FA7B] py-4 text-lg font-bold text-[#282A36] transition hover:scale-[1.02] disabled:opacity-60"
                  >
                    {loading
                      ? "Importando..."
                      : "Importar Planilha"}
                  </button>

                </div>

              </div>
            )}

            {success && (
              <div className="mt-8 rounded-2xl border border-green-500 bg-green-500/10 p-6">

                <h3 className="text-xl font-bold text-green-400">
                  ✅ Importação concluída
                </h3>

                <p className="mt-2 text-[#BDC1D6]">
                  A planilha foi importada com sucesso e os dashboards foram atualizados.
                </p>

              </div>
            )}

            <div className="mt-8 rounded-3xl border border-[#44475A] bg-[#282A36] p-6">

              <h2 className="mb-5 text-xl font-bold text-white">
                Histórico de Importações
              </h2>

              {selectedFile ? (
                <div className="rounded-2xl bg-[#343746] p-4">

                  <p className="font-semibold text-[#50FA7B]">
                    ✔ {selectedFile.name}
                  </p>

                  <p className="mt-2 text-sm text-[#BDC1D6]">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>
              ) : (
                <p className="text-[#BDC1D6]">
                  Nenhuma importação realizada nesta sessão.
                </p>
              )}

            </div>

            <button
              onClick={handleLogout}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 text-lg font-bold text-white transition hover:bg-red-600"
            >
              <LogOut size={22} />
              Sair da Administração
            </button>

          </div>

        </div>

      </MainLayout>
    );
  }
    return (
    <div className="flex min-h-screen items-center justify-center bg-[#282A36] p-6">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3b4252_0%,transparent_60%)] opacity-40"></div>

      <form
        onSubmit={handleLogin}
        className="
          relative
          w-full
          max-w-md
          rounded-3xl
          border
          border-[#44475A]
          bg-[#343746]
          p-10
          shadow-2xl
        "
      >

        <div className="mb-10 text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#282A36] shadow-lg">

            <ShieldCheck
              size={52}
              className="text-[#50FA7B]"
            />

          </div>

          <p className="mt-6 text-sm uppercase tracking-[5px] text-[#50FA7B]">
            TRK FLOREST
          </p>

          <h1 className="mt-3 text-4xl font-black text-white">
            Administração
          </h1>

          <p className="mt-4 text-[#BDC1D6]">
            Faça login para acessar o painel administrativo.
          </p>

        </div>

        <label className="mb-2 block text-sm font-semibold text-[#BDC1D6]">
          Senha
        </label>

        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-[#44475A]
            bg-[#282A36]
            p-4
            text-white
            outline-none
            transition
            focus:border-[#50FA7B]
            focus:ring-2
            focus:ring-[#50FA7B]
          "
        />

        <button
          type="submit"
          className="
            mt-8
            w-full
            rounded-2xl
            bg-[#50FA7B]
            py-4
            text-lg
            font-bold
            text-[#282A36]
            transition-all
            hover:scale-[1.02]
            hover:shadow-xl
          "
        >
          Entrar
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            mt-4
            w-full
            rounded-2xl
            border
            border-[#44475A]
            py-4
            font-semibold
            text-[#BDC1D6]
            transition-all
            hover:bg-[#44475A]
          "
        >
          Voltar ao Dashboard
        </button>

      </form>

    </div>
  );
}