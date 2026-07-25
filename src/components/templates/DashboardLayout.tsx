import type { ReactNode } from "react";

import MainLayout from "../layout/MainLayout";
import Header from "../layout/Header";
import Container from "../layout/Container";
import FilterBar from "../filters/FilterBar";

type DashboardLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function DashboardLayout({
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  return (
    <MainLayout>
      <div className="pt-8">
        <Container>

          <Header
            title={title}
            subtitle={subtitle}
          />

          <div className="h-6" />

          <FilterBar />

          <div className="h-6" />

          {children}

        </Container>
      </div>
    </MainLayout>
  );
}