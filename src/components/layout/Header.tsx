import { Upload, CalendarDays, Leaf } from "lucide-react";
import { useRef } from "react";
import { useExcel } from "../../hooks/useExcel";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  const { loadExcel } = useExcel();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await loadExcel(file);
      console.log("Planilha carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao importar:", error);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <header className="mb-8 overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-xl">
        {/* Linha superior */}
        <div className="h-1 bg-gradient-to-r from-[#50FA7B] via-[#8BE9FD] to-[#BD93F9]" />

        <div className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          {/* ESQUERDA */}
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#44475A] bg-[#282A36]">
              <Leaf size={30} className="text-[#50FA7B]" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 text-[#BDC1D6]">
                  {subtitle}
                </p>
              )}

              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#44475A] bg-[#282A36] px-4 py-2 text-sm text-[#8BE9FD]">
                <CalendarDays size={16} />
                <span>
                  Atualizado em {new Date().toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* DIREITA */}
          <div className="flex flex-wrap items-center justify-end gap-3 lg:min-w-[220px]">
            <button
              onClick={handleImportClick}
              className="
                flex
                h-12
                items-center
                gap-2
                rounded-xl
                bg-[#50FA7B]
                px-6
                font-semibold
                text-[#282A36]
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-lg
                hover:shadow-[#50FA7B]/30
              "
            >
              <Upload size={18} />
              Importar Excel
            </button>
          </div>
        </div>
      </header>
    </>
  );
}