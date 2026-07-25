import { CalendarDays, Leaf } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header className="mb-8 overflow-hidden rounded-2xl border border-[#44475A] bg-[#343746] shadow-xl">
      {/* Linha superior */}
      <div className="h-1 bg-gradient-to-r from-[#50FA7B] via-[#8BE9FD] to-[#BD93F9]" />

      <div className="flex flex-col gap-6 px-6 py-8">
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
      </div>
    </header>
  );
}