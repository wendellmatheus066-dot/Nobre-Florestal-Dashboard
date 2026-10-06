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
    <div
      className="
        flex
        min-h-screen
        gap-0
        bg-[#282A36]
        text-[#F8F8F2]
        lg:gap-6
      "
    >
      {/* ================= SIDEBAR MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ================= ÁREA PRINCIPAL ================= */}
      <main
        className="
          min-w-0
          flex-1
          overflow-y-auto
        "
      >
        <div className="w-full">

          <div
            className="
              mx-auto
              w-full
              max-w-[1550px]
              px-5
              py-7
              sm:px-7
              sm:py-8
              lg:px-8
              lg:py-9
              xl:px-10
              2xl:px-12
            "
          >

            {/* ================= BOTÃO MOBILE ================= */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                mb-6
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
                lg:hidden
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