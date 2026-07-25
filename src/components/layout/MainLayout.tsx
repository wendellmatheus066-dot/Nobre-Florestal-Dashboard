import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#282A36] text-[#F8F8F2]">

      {/* Fundo escuro no celular */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:ml-0">
        {/* Botão do menu (somente celular) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-4 lg:hidden"
        >
          <Menu size={28} />
        </button>

        {children}
      </main>
    </div>
  );
}