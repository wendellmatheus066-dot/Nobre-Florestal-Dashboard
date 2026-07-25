import {
  ShieldCheck,
  Database,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminStats() {
  return (
    <div className="grid gap-6 md:grid-cols-4">

      <Card
        icon={<ShieldCheck size={28} className="text-[#50FA7B]" />}
        titulo="Administrador"
        valor="Wendell"
      />

      <Card
        icon={<Database size={28} className="text-[#8BE9FD]" />}
        titulo="Banco"
        valor="Supabase Online"
      />

      <Card
        icon={<FileSpreadsheet size={28} className="text-[#FFB86C]" />}
        titulo="Registros"
        valor="2.219"
      />

      <Card
        icon={<CalendarDays size={28} className="text-[#F1FA8C]" />}
        titulo="Atualização"
        valor="Agora"
      />

    </div>
  );
}

type Props = {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
};

function Card({ icon, titulo, valor }: Props) {
  return (
    <div className="rounded-2xl border border-[#44475A] bg-[#343746] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h2 className="font-bold text-white">
          {titulo}
        </h2>
      </div>

      <p className="font-semibold text-[#BDC1D6]">
        {valor}
      </p>

    </div>
  );
}