import { useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#282A36] text-[#F8F8F2]">

      {/* Overlay somente no celular */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Conteúdo */}
      <main
        className="
          flex-1
          min-w-0
          overflow-y-auto
          p-4
          sm:p-5
          lg:p-6
        "
      >

        {/* Botão do menu (somente celular) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="
            mb-4
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-[#343746]
            border
            border-[#44475A]
            text-white
            shadow-lg
            lg:hidden
          "
        >
          <Menu size={22} />
        </button>

        {children}

      </main>

    </div>
  );
}