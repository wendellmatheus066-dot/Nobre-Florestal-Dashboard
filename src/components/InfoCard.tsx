type Props = {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  cor: string;
};

export default function InfoCard({
  icon,
  titulo,
  valor,
  cor,
}: Props) {
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
        hover:border-[#6272A4]
        hover:bg-[#3A3D4D]
        hover:-translate-y-1
      "
    >
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div
          className={`
            flex
            h-16
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-[#4E5675]
            bg-[#282A36]
            ${cor}
          `}
        >
          {icon}
        </div>

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-[#8E96B3]
            "
          >
            {titulo}
          </p>

          <h3
            className="
              mt-100
              text-2xl
              font-bold
              leading-tight
              text-white
              break-words
            "
          >
            {valor}
          </h3>
        </div>
      </div>
    </div>
  );
}