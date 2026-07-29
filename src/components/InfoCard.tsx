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
        rounded-3xl
        border
        border-[#44475A]
        bg-[#343746]
        p-6
      "
    >

      <div
        className={`
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-[#282A36]
          ${cor}
        `}
      >

        {icon}

      </div>


      <p className="text-sm text-[#BDC1D6]">
        {titulo}
      </p>


      <h3 className="mt-2 text-xl font-bold text-white">
        {valor}
      </h3>


    </div>

  );

}