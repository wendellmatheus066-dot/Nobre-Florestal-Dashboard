import InfoCard from "../components/InfoCard";

import {
  useState,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Upload,
  LogOut,
  Database,
  CalendarDays,
  HardDrive,
  UserCheck,
} from "lucide-react";

import * as XLSX from "xlsx";

import MainLayout from "../components/layout/MainLayout";

import {
  useAuth,
} from "../context/AuthContext";

import {
  salvarPlanilha,
} from "../services/uploadExcelSupabase";

export default function Admin() {

  const {
    isAdmin,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [tipoImportacao, setTipoImportacao] =
    useState("inventario");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    console.log("=================================");
    console.log("ARQUIVO SELECIONADO");
    console.log("Nome:", file.name);
    console.log("Tamanho:", file.size);
    console.log("Tipo:", file.type);
    console.log("=================================");

    setSelectedFile(file);
    setSuccess(false);
  }

  async function handleImport() {

    console.log("=================================");
    console.log("INÍCIO DA IMPORTAÇÃO");
    console.log("=================================");

    if (!selectedFile) {
      console.error("NENHUM ARQUIVO SELECIONADO");
      alert("Selecione um arquivo");
      return;
    }

    console.log("Arquivo:", selectedFile.name);
    console.log("Tipo de importação:", tipoImportacao);

    try {

      setLoading(true);

      // ========================================
      // ETAPA 1 - LER ARQUIVO
      // ========================================

      console.log("---------------------------------");
      console.log("ETAPA 1: LENDO ARQUIVO...");
      console.log("---------------------------------");

      const buffer =
        await selectedFile.arrayBuffer();

      console.log(
        "Arquivo convertido para ArrayBuffer."
      );

      console.log(
        "Tamanho do buffer:",
        buffer.byteLength
      );

      // ========================================
      // ETAPA 2 - LER EXCEL
      // ========================================

      console.log("---------------------------------");
      console.log("ETAPA 2: LENDO EXCEL...");
      console.log("---------------------------------");

      const workbook =
        XLSX.read(buffer, {
          type: "array",
          cellDates: true,
        });

      console.log(
        "Excel lido com sucesso."
      );

      console.log(
        "ABAS ENCONTRADAS:",
        workbook.SheetNames
      );

      // ========================================
      // INVENTÁRIO
      // ========================================

      if (
        tipoImportacao === "inventario"
      ) {

        console.log("---------------------------------");
        console.log("IMPORTAÇÃO DE INVENTÁRIO");
        console.log("---------------------------------");

        const primeiraAba =
          workbook.SheetNames[0];

        console.log(
          "Primeira aba:",
          primeiraAba
        );

        const dados =
          XLSX.utils.sheet_to_json(
            workbook.Sheets[primeiraAba],
            {
              raw: false,
              defval: "",
            }
          );

        console.log(
          "Inventário encontrado:",
          dados.length
        );

        console.log(
          "Enviando inventário para Supabase..."
        );

        await salvarPlanilha(
          "inventario",
          dados
        );

        console.log(
          "INVENTÁRIO ENVIADO COM SUCESSO."
        );
      }

      // ========================================
      // OPERAÇÃO
      // ========================================

      if (
        tipoImportacao === "operacao"
      ) {

        console.log("---------------------------------");
        console.log("ETAPA 3: PROCESSANDO OPERAÇÃO");
        console.log("---------------------------------");

        console.log(
          "Quantidade de abas:",
          workbook.SheetNames.length
        );

        for (
          const aba of workbook.SheetNames
        ) {

          console.log("");
          console.log("=================================");
          console.log(
            "PROCESSANDO ABA:",
            aba
          );
          console.log("=================================");

          const sheet =
            workbook.Sheets[aba];

          if (!sheet) {

            console.error(
              "ERRO: PLANILHA NÃO ENCONTRADA:",
              aba
            );

            continue;
          }

          const dados =
            XLSX.utils.sheet_to_json(
              sheet,
              {
                raw: false,
                defval: "",
              }
            );

          const nome =
            aba
              .normalize("NFD")
              .replace(
                /[\u0300-\u036f]/g,
                ""
              )
              .toUpperCase();

          console.log(
            "Nome normalizado:",
            nome
          );

          console.log(
            "Quantidade de registros:",
            dados.length
          );

          // ==================================
          // PRODUÇÃO
          // ==================================

          if (
            nome === "PRODUCAO"
          ) {

            console.log(
              ">>> PRODUÇÃO ENCONTRADA"
            );

            await salvarPlanilha(
              "producao",
              dados
            );

            console.log(
              ">>> PRODUÇÃO ENVIADA"
            );
          }

          // ==================================
          // ARRASTE
          // ==================================

          if (
            nome === "ARRASTE"
          ) {

            console.log(
              ">>> ARRASTE ENCONTRADO"
            );

            await salvarPlanilha(
              "arraste",
              dados
            );

            console.log(
              ">>> ARRASTE ENVIADO"
            );
          }

          // ==================================
          // MEDIÇÃO
          // ==================================

          if (
            nome === "MEDICAO"
          ) {

            console.log(
              ">>> MEDIÇÃO ENCONTRADA"
            );

            await salvarPlanilha(
              "medicao",
              dados
            );

            console.log(
              ">>> MEDIÇÃO ENVIADA"
            );
          }

          // ==================================
          // JUSTIFICADAS
          // ==================================

          if (
            nome === "JUSTIFICADAS"
          ) {

            console.log(
              ">>> JUSTIFICADAS ENCONTRADAS:",
              dados.length
            );

            await salvarPlanilha(
              "justificadas",
              dados
            );

            console.log(
              ">>> JUSTIFICADAS ENVIADAS"
            );
          }

          // ==================================
          // TRANSPORTE
          // ==================================

          if (
            nome === "TRANSPORTE"
          ) {

            console.log(
              "#################################"
            );

            console.log(
              ">>> TRANSPORTE ENCONTRADA"
            );

            console.log(
              "Quantidade de registros:",
              dados.length
            );

            if (dados.length > 0) {

              console.log(
                "Primeiro registro TRANSPORTE:",
                dados[0]
              );

            } else {

              console.warn(
                "A ABA TRANSPORTE ESTÁ VAZIA."
              );

            }

            console.log(
              ">>> INICIANDO ENVIO PARA SUPABASE"
            );

            await salvarPlanilha(
              "transporte",
              dados
            );

            console.log(
              ">>> TRANSPORTE ENVIADA COM SUCESSO"
            );

            console.log(
              "#################################"
            );
          }
        }

        console.log("---------------------------------");
        console.log(
          "TODAS AS ABAS DA OPERAÇÃO PROCESSADAS"
        );
        console.log("---------------------------------");
      }

      // ========================================
      // FINAL
      // ========================================

      console.log("=================================");
      console.log("IMPORTAÇÃO FINALIZADA COM SUCESSO");
      console.log("=================================");

      setSuccess(true);

    } catch (error) {

      console.error("=================================");
      console.error("ERRO IMPORTAÇÃO");
      console.error("=================================");

      console.error(
        "Objeto completo do erro:",
        error
      );

      if (error instanceof Error) {

        console.error(
          "Nome do erro:",
          error.name
        );

        console.error(
          "Mensagem:",
          error.message
        );

        console.error(
          "Stack:",
          error.stack
        );

      }

      alert(
        "Erro na importação. Veja o console."
      );

    } finally {

      console.log(
        "FINALIZANDO PROCESSO DE IMPORTAÇÃO."
      );

      setLoading(false);
    }
  }

  if (isAdmin) {

    return (
      <MainLayout>

        <div
          className="
            mx-auto
            w-full
            max-w-[1400px]
            px-12
            py-12
          "
        >

          <div className="mb-12">

            <p
              className="
                text-sm
                uppercase
                tracking-[5px]
                text-[#50FA7B]
              "
            >
              TRK FLOREST
            </p>

            <h1
              className="
                mt-2
                text-5xl
                font-black
                text-white
              "
            >
              Painel Administrativo
            </h1>

            <p
              className="
                mt-4
                max-w-3xl
                text-xl
                leading-9
                text-[#BDC1D6]
              "
            >
              Gerencie importações de planilhas e mantenha os dados do sistema atualizados.
            </p>

          </div>

          <div
            className="
              grid
              gap-8
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

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
              titulo="Arquivo"
              valor={
                selectedFile
                  ? "Carregado"
                  : "--"
              }
              cor="text-[#F1FA8C]"
            />

          </div>

          <div
            className="
              mt-14
              rounded-3xl
              border
              border-[#44475A]
              bg-[#343746]
              p-10
            "
          >

            <h2
              className="
                mb-6
                text-3xl
                font-bold
                text-white
              "
            >
              Importação de Planilhas
            </h2>

            <select
              value={tipoImportacao}
              onChange={(e) =>
                setTipoImportacao(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#6272A4]
                bg-[#282A36]
                h-16
                px-6
                text-lg
                font-bold
                text-white
              "
            >

              <option value="inventario">
                🌳 Inventário
              </option>

              <option value="operacao">
                🚛 Derruba / Arraste / Medição / Justificadas / Transporte
              </option>

            </select>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                mt-6
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
                h-20
                text-xl
                font-bold
                text-white
                hover:border-[#50FA7B]
              "
            >

              <Upload size={24} />

              Selecionar Excel

            </button>

            {selectedFile && (

              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-[#44475A]
                  bg-[#282A36]
                  p-10
                "
              >

                <h3
                  className="
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  {selectedFile.name}
                </h3>

                <p
                  className="
                    mt-3
                    text-[#BDC1D6]
                  "
                >
                  Arquivo pronto para importar.
                </p>

                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="
                    mt-8
                    w-full
                    rounded-2xl
                    bg-[#50FA7B]
                    h-16
                    text-lg
                    font-bold
                    text-[#282A36]
                    disabled:opacity-50
                  "
                >

                  {loading
                    ? "Importando..."
                    : "Importar Dados"}

                </button>

              </div>

            )}

            {success && (

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-green-500
                  bg-green-500/10
                  p-6
                "
              >

                <h3
                  className="
                    text-xl
                    font-bold
                    text-green-400
                  "
                >
                  ✅ Importação concluída
                </h3>

                <p
                  className="
                    mt-2
                    text-[#BDC1D6]
                  "
                >
                  Dados enviados para o Supabase com sucesso.
                </p>

              </div>

            )}

            <button
              onClick={() =>
                navigate(
                  "/admin/usuarios"
                )
              }
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-[#8BE9FD]
                h-16
                text-lg
                font-bold
                text-[#282A36]
                hover:bg-cyan-300
              "
            >

              <UserCheck size={22} />

              Gerenciar Usuários

            </button>

            <button
              onClick={handleLogout}
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-red-500
                h-16
                text-lg
                font-bold
                text-white
                hover:bg-red-600
              "
            >

              <LogOut size={22} />

              Sair da Administração

            </button>

          </div>

        </div>

      </MainLayout>
    );
  }

  return null;
}