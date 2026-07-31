import { useEffect, useState } from "react";
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
        <div className="w-full flex justify-center">
          <div
            className="
              w-full
              max-w-[1550px]
              px-10
              py-10
              sm:px-12
              lg:px-14
              xl:px-16
              2xl:px-20
            "
          >
            {/* Botão Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                lg:hidden
                mb-8
                flex
                h-11
                w-11
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
              "
            >
              <Menu size={22} />
            </button>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}