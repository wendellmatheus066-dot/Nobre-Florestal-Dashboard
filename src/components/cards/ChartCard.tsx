import { BarChart3 } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function ChartCard({
  title,
  children,
}: Props) {
  return (
    <section
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-[#44475A]
        bg-[#343746]
        shadow-lg
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-[#50FA7B]
        hover:shadow-[0_0_40px_rgba(80,250,123,.18)]
      "
    >
      {/* Barra RGB */}
      <div className="h-1 w-full top-gradient" />

      {/* Glow */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
        style={{
          boxShadow: "inset 0 0 25px rgba(80,250,123,.08)",
        }}
      />

      {/* Cabeçalho */}
      <header className="flex items-center border-b border-[#44475A] px-6 py-5">

        <div className="flex items-center gap-4">

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-[#50FA7B]/20
              bg-[#44475A]
              text-[#50FA7B]
              transition-all
              duration-500
              group-hover:scale-110
              group-hover:bg-[#50FA7B]
              group-hover:text-[#282A36]
              group-hover:shadow-[0_0_25px_rgba(80,250,123,.45)]
            "
          >
            <BarChart3 className="h-6 w-6" />
          </div>

          <div>

            <h2 className="text-xl font-bold text-[#F8F8F2]">
              {title}
            </h2>

            <p className="text-sm text-[#8F93A8]">
              
            </p>

          </div>

        </div>

      </header>

      {/* Conteúdo */}
      <div className="bg-[#343746] p-6">
        {children}
      </div>

    </section>
  );
}