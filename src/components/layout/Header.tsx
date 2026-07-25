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
      console.error(error);
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

      <header className="mb-6 overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-xl">

        <div className="h-1 bg-gradient-to-r from-[#50FA7B] via-[#8BE9FD] to-[#BD93F9]" />

        <div className="flex flex-col gap-5 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

          {/* ESQUERDA */}
          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-[#44475A] bg-[#282A36] flex-shrink-0">
              <Leaf size={28} className="text-[#50FA7B]" />
            </div>

            <div className="min-w-0 flex-1">

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 text-sm sm:text-base text-[#BDC1D6] break-words">
                  {subtitle}
                </p>
              )}

              <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-[#44475A] bg-[#282A36] px-3 py-2 text-xs sm:text-sm text-[#8BE9FD]">
                <CalendarDays size={15} />
                <span className="truncate">
                  Atualizado em {new Date().toLocaleString("pt-BR")}
                </span>
              </div>

            </div>

          </div>

          {/* DIREITA */}
          <div className="flex w-full lg:w-auto">

            <button
              onClick={handleImportClick}
              className="
                flex
                w-full
                lg:w-auto
                h-11
                sm:h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#50FA7B]
                px-5
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