import {
  Trees,
  Users,
  CalendarDays,
  TrendingUp,
  Leaf,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";
import FilterBar from "../components/filters/FilterBar";

import KpiCard from "../components/cards/KpiCard";
import ChartCard from "../components/cards/ChartCard";

import ProductionChart from "../components/charts/ProductionChart";
import RankingChart from "../components/charts/RankingChart";
import UTChart from "../components/charts/UTChart";
import SpeciesChart from "../components/charts/SpeciesChart";

import { useExcel } from "../hooks/useExcel";
import { useFilters } from "../context/FilterContext";
import { processDashboardData } from "../services/dataProcessor";

export default function Dashboard() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.derruba
  );

  return (
    <MainLayout>
      <Container>

        {/* =====================================================
            HEADER
        ===================================================== */}
        <Header
          title="Dashboard de Produção"
          subtitle="Sistema de Gestão Florestal - NOBRE FLORESTAL"
        />

        {/* Espaço entre Header e Filtros */}
        <div className="h-8" />

        {/* =====================================================
            FILTROS
        ===================================================== */}
        <FilterBar tipo="derruba" />

        {/* Espaço entre Filtros e KPIs */}
        <div className="h-9" />

        {/* =====================================================
            KPIs
        ===================================================== */}
        <section
          className="
            grid
            grid-cols-1
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-5
          "
        >
          <KpiCard
            title="Produção Geral"
            value={dashboard.indicadores.producaoTotal.toLocaleString(
              "pt-BR"
            )}
            icon={<Trees size={22} />}
          />

          <KpiCard
            title="Operadores Ativos"
            value={dashboard.indicadores.operadores.toLocaleString(
              "pt-BR"
            )}
            icon={<Users size={22} />}
          />

          <KpiCard
            title="Dias Trabalhados"
            value={dashboard.indicadores.dias.toLocaleString(
              "pt-BR"
            )}
            icon={<CalendarDays size={22} />}
          />

          <KpiCard
            title="Média por Dia"
            value={dashboard.indicadores.media.toLocaleString(
              "pt-BR"
            )}
            icon={<TrendingUp size={22} />}
          />

          <KpiCard
            title="Espécies Exploradas"
            value={dashboard.indicadores.especies.toLocaleString(
              "pt-BR"
            )}
            icon={<Leaf size={22} />}
          />
        </section>

        {/* Espaço entre KPIs e gráficos */}
        <div className="h-10" />

        {/* =====================================================
            PRIMEIRA LINHA DE GRÁFICOS
        ===================================================== */}
        <section
          className="
            grid
            grid-cols-1
            gap-7
            xl:grid-cols-12
          "
        >

          {/* PRODUÇÃO POR DIA */}
          <div className="min-w-0 xl:col-span-8">
            <ChartCard title="Produção por Dia">
              <ProductionChart />
            </ChartCard>
          </div>

          {/* DESTAQUE */}
          <div className="min-w-0 xl:col-span-4">
            <ChartCard title="DESTAQUE">
              <RankingChart />
            </ChartCard>
          </div>

        </section>

        {/* Espaço entre as linhas */}
        <div className="h-8" />

        {/* =====================================================
            SEGUNDA LINHA DE GRÁFICOS
        ===================================================== */}
        <section
          className="
            grid
            grid-cols-1
            gap-7
            xl:grid-cols-2
          "
        >

          {/* PRODUÇÃO POR UT */}
          <div className="min-w-0">
            <ChartCard title="Produção por UT">
              <UTChart />
            </ChartCard>
          </div>

          {/* PRODUÇÃO POR ESPÉCIE */}
          <div className="min-w-0">
            <ChartCard title="Produção por Espécie">
              <SpeciesChart />
            </ChartCard>
          </div>

        </section>

        {/* Espaço inferior */}
        <div className="h-8" />

      </Container>
    </MainLayout>
  );
}