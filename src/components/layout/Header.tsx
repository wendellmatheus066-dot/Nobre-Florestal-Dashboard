import { useEffect, useState } from "react";
import { CalendarDays, Leaf } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  const [ultimaAtualizacao, setUltimaAtualizacao] =
    useState("Carregando...");

  useEffect(() => {
    async function carregarData() {
      const { data } = await supabase
        .from("configuracoes")
        .select("*");

      if (data && data.length > 0) {
        setUltimaAtualizacao(
          new Date(data[0].valor).toLocaleString("pt-BR")
        );
      }
    }

    carregarData();
  }, []);

  return (
    <header className="mb-6 rounded-2xl border border-[#44475A] bg-[#343746] shadow-lg">

      <div className="h-1 bg-gradient-to-r from-[#50FA7B] via-[#8BE9FD] to-[#BD93F9]" />

      <div className="flex items-center gap-5 px-8 py-6">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#44475A] bg-[#282A36]">
          <Leaf size={26} className="text-[#50FA7B]" />
        </div>

        <div className="flex-1">

          <h1 className="text-[2rem] font-bold leading-none text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-base text-[#BDC1D6]">
              {subtitle}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#44475A] bg-[#282A36] px-3 py-2 text-sm text-[#8BE9FD]">

            <CalendarDays size={16} />

            <span>
              Atualizado em {ultimaAtualizacao}
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}