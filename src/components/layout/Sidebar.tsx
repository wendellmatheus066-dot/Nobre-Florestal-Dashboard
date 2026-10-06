import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Truck,
  Ruler,
  Map,
  Settings,
  ChevronRight,
  LogOut,
  X,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const menus = [
  {
    icon: Home,
    title: "Painel Central",
    path: "/painel-central",
  },
  {
    icon: LayoutDashboard,
    title: "Derruba",
    path: "/",
  },
  {
    icon: ClipboardList,
    title: "Justificadas",
    path: "/justificadas",
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
    icon: Truck,
    title: "Transporte",
    path: "/transporte",
  },
  {
    icon: Map,
    title: "Mapa Florestal",
    path: "/mapa",
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const { isAdmin, logout } = useAuth();

  return (
    <>
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[190px]
          bg-[#21222C]
          text-[#F8F8F2]
          shadow-2xl
          transition-transform
          duration-300

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          lg:sticky
          lg:top-0
          lg:translate-x-0
          lg:flex
          lg:h-screen
          lg:flex-col
          lg:shrink-0
          lg:rounded-none
        `}
      >
        {/* Linha lateral */}
        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-full
            w-px
            bg-[#44475A]
          "
        />

        <div className="flex h-full flex-col">

          {/* =====================================================
              BOTÃO FECHAR MOBILE
          ===================================================== */}
          <div className="flex justify-end p-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="
                rounded-lg
                p-2
                text-[#BDC1D6]
                transition
                hover:bg-[#343746]
                hover:text-white
              "
            >
              <X size={22} />
            </button>
          </div>

          {/* =====================================================
              LOGO
          ===================================================== */}
          <div className="flex flex-col items-center px-4 pt-6">

            <div className="relative flex h-24 w-24 items-center justify-center">

              <div
                className="
                  logo-ring
                  absolute
                  inset-0
                  rounded-full
                "
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-[#44475A]
                  shadow-xl
                "
              >
                <img
                  src="/logo.png"
                  alt="Logo TRK Florest"
                  className="
                    h-full
                    w-full
                    rounded-full
                    object-cover
                    p-2
                  "
                />
              </div>

              {/* Status */}
              <span
                className="
                  absolute
                  bottom-1
                  right-1
                  z-20
                  h-3.5
                  w-3.5
                  rounded-full
                  border-2
                  border-[#21222C]
                  bg-[#50FA7B]
                "
              />
            </div>

            <h2
              className="
                mt-4
                text-center
                text-xl
                font-bold
                tracking-wide
                text-[#F8F8F2]
              "
            >
              サンチェフ
            </h2>

            <p
              className="
                mt-1
                flex
                items-center
                gap-2
                text-xs
                text-[#BDC1D6]
              "
            >
              <span className="h-2 w-2 rounded-full bg-[#50FA7B]" />
              Administrador
            </p>

          </div>

          {/* =====================================================
              MENU
          ===================================================== */}
          <nav
            className="
              mt-7
              flex-1
              overflow-y-auto
              px-3
              pb-4
            "
          >
            <div className="flex flex-col gap-2">

              {menus.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `
                        group
                        flex
                        min-h-[48px]
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-3
                        py-3
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-[#50FA7B]/30
                              bg-[#44475A]
                              shadow-[0_4px_15px_rgba(80,250,123,.08)]
                            `
                            : `
                              border-transparent
                              hover:bg-[#343746]
                            `
                        }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex min-w-0 items-center gap-3">

                          <Icon
                            size={20}
                            className={`
                              shrink-0
                              transition-colors
                              duration-200

                              ${
                                isActive
                                  ? "text-[#50FA7B]"
                                  : "text-[#8BE9FD] group-hover:text-[#50FA7B]"
                              }
                            `}
                          />

                          <span
                            className={`
                              truncate
                              text-sm
                              font-semibold

                              ${
                                isActive
                                  ? "text-[#F8F8F2]"
                                  : "text-[#BDC1D6]"
                              }
                            `}
                          >
                            {item.title}
                          </span>

                        </div>

                        {isActive && (
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-[#50FA7B]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* =================================================
                  ADMINISTRAÇÃO
              ================================================= */}
              {isAdmin && (
                <>
                  <div className="my-4 border-t border-[#44475A]" />

                  <p
                    className="
                      px-3
                      pb-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.20em]
                      text-[#6272A4]
                    "
                  >
                    Administração
                  </p>

                  <NavLink
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `
                        group
                        flex
                        min-h-[48px]
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-3
                        py-3
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-[#50FA7B]/30
                              bg-[#44475A]
                            `
                            : `
                              border-transparent
                              hover:bg-[#343746]
                            `
                        }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex min-w-0 items-center gap-3">

                          <Settings
                            size={20}
                            className={`
                              shrink-0

                              ${
                                isActive
                                  ? "text-[#50FA7B]"
                                  : "text-[#8BE9FD] group-hover:text-[#50FA7B]"
                              }
                            `}
                          />

                          <span
                            className={`
                              truncate
                              text-sm
                              font-semibold

                              ${
                                isActive
                                  ? "text-[#F8F8F2]"
                                  : "text-[#BDC1D6]"
                              }
                            `}
                          >
                            Administração
                          </span>

                        </div>

                        {isActive && (
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-[#50FA7B]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </>
              )}

            </div>
          </nav>

          {/* =====================================================
              RODAPÉ
          ===================================================== */}
          <footer
            className="
              shrink-0
              border-t
              border-[#44475A]
              bg-[#1D1F28]
              px-3
              py-4
            "
          >
            <button
              type="button"
              onClick={async () => {
                await logout();
                setSidebarOpen(false);
              }}
              className="
                mb-4
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-[#F8F8F2]
                transition
                hover:bg-[#343746]
              "
            >
              <LogOut
                size={19}
                className="text-red-400"
              />

              <span className="text-sm font-semibold">
                Sair
              </span>
            </button>

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.30em]
                text-[#6272A4]
              "
            >
              SISTEMA
            </p>

            <h3 className="mt-1 text-sm font-semibold">
              TRK FLOREST
            </h3>

            <p className="mt-1 text-xs text-[#BDC1D6]">
              Versão 2.0.0
            </p>
          </footer>

        </div>
      </aside>
    </>
  );
}