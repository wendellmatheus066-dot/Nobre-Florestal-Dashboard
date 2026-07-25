import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Ruler,
  Settings,
  ChevronRight,
} from "lucide-react";

const menus = [
  {
    icon: LayoutDashboard,
    title: "Derruba",
    path: "/",
  },
  {
    icon: Truck,
    title: "Arraste",
    path: "/arraste",
  },
  {
    icon: Ruler,
    title: "Medição",
    path: "/medicao",
  },
  {
    icon: Settings,
    title: "Configurações",
    path: "/configuracoes",
  },
];

export default function Sidebar() {
  return (
    <aside className="relative flex h-screen w-[180px] shrink-0 flex-col overflow-hidden bg-[#21222C] text-[#F8F8F2] shadow-2xl mr-6">

      {/* Gradiente Superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#BD93F9]/10 to-transparent" />

      {/* Barra RGB */}
      <div className="absolute inset-y-0 right-0 w-1 top-gradient" />

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">

        {/* PERFIL */}
        <div className="flex flex-col items-center pt-10">

          <div className="relative flex h-28 w-28 items-center justify-center">

            <div className="logo-ring absolute inset-0 rounded-full" />

            <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#44475A]">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full rounded-full object-cover p-2"
              />
            </div>

            <span className="absolute bottom-1 right-1 z-20 h-4 w-4 rounded-full border-[3px] border-[#21222C] bg-[#50FA7B]" />

          </div>

          <div className="h-5" />

          <h2 className="text-2xl font-bold tracking-wide">
            サンチェフ
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-[#BDC1D6]">
            <span className="h-2 w-2 rounded-full bg-[#50FA7B]" />
            Administrador
          </p>

        </div>

        {/* MENU */}
        <nav className="mt-8 flex-1 overflow-y-auto px-5">

          <div className="flex flex-col gap-3">

            {menus.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
                      isActive
                        ? "border border-[#50FA7B]/30 bg-[#44475A] shadow-lg shadow-[#50FA7B]/20"
                        : "hover:bg-[#343746]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-4">

                        <Icon
                          size={20}
                          className={
                            isActive
                              ? "text-[#50FA7B]"
                              : "text-[#8BE9FD] group-hover:text-[#50FA7B]"
                          }
                        />

                        <span
                          className={
                            isActive
                              ? "font-semibold text-[#F8F8F2]"
                              : "font-medium text-[#BDC1D6]"
                          }
                        >
                          {item.title}
                        </span>

                      </div>

                      {isActive && (
                        <ChevronRight
                          size={18}
                          className="text-[#50FA7B]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* Rodapé */}
        <footer className="mt-auto border-t border-[#44475A] bg-[#1D1F28] px-5 py-5">

          <p className="text-[10px] uppercase tracking-[0.3em] text-[#6272A4]">
            SISTEMA
          </p>

          <h3 className="mt-2 text-sm font-semibold text-[#F8F8F2]">
            TRK FLOREST
          </h3>

          <p className="mt-1 text-xs text-[#BDC1D6]">
            Versão 1.0.0
          </p>

        </footer>

      </div>

    </aside>
  );
}