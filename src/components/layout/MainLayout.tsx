import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#282A36] text-[#F8F8F2]">

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* ESTE DIV CRIA O ESPAÇO DA SIDEBAR */}
        <div className="w-full pl-8 lg:pl-10 xl:pl-12 2xl:pl-14">

          <div
            className="
              mx-auto
              w-full
              max-w-[1700px]
              px-6
              py-6
              sm:px-8
              xl:px-10
            "
          >

            {/* Botão Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                mb-6
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-[#44475A]
                bg-[#343746]
                text-white
                transition-all
                duration-200
                hover:bg-[#44475A]
                lg:hidden
              "
            >
              <Menu size={20} />
            </button>

            {children}

          </div>

        </div>

      </main>

    </div>
  );
}