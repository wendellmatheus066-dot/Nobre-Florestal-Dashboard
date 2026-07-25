import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex h-screen gap-2 overflow-hidden bg-[#282A36] text-[#F8F8F2]">

      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#282A36] pr-8 pt-6 pb-6">
        {children}
      </main>

    </div>
  );
}