import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
  footer?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  color = "text-white",
  subtitle,
  footer = "Indicador atualizado",
}: KpiCardProps) {
  return (
    <div
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#44475A]
        bg-[#343746]
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#50FA7B]
        hover:shadow-[0_10px_25px_rgba(80,250,123,.18)]
      "
    >
      {/* Barra Superior Animada */}
      <div className="top-gradient h-1 w-full" />

      <div className="flex flex-1 flex-col justify-between p-6">
        {/* Conteúdo */}
        <div>
          {/* Título */}
          <p className="text-center text-sm font-semibold text-[#BDC1D6]">
            {title}
          </p>

          {/* Subtítulo */}
          {subtitle && (
            <p className="mt-1 text-center text-xs text-[#8F93A8]">
              {subtitle}
            </p>
          )}

          {/* Número + Ícone */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {icon && (
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#4E5369]
                  bg-[#3E4153]
                  text-[#50FA7B]
                  transition-all
                  duration-300
                  group-hover:bg-[#50FA7B]
                  group-hover:text-[#282A36]
                "
              >
                {icon}
              </div>
            )}

            <h2
              className={`text-6xl font-extrabold leading-none tracking-tight ${color}`}
            >
              {value}
            </h2>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#44475A] pt-4">
          <TrendingUp
            size={16}
            className="text-[#50FA7B] transition-transform duration-300 group-hover:scale-110"
          />

          <span className="text-sm font-semibold text-[#50FA7B]">
            {footer}
          </span>
        </div>
      </div>
    </div>
  );
}