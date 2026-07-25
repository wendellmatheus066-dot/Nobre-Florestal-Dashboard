import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div
      className="
        mx-auto
        w-full
        max-w-7xl
        pl-10
        pr-6
        xl:pl-16
        xl:pr-12
      "
    >
      {children}
    </div>
  );
}