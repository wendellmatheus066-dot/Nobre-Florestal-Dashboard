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
      <div className="pt-8">
        <Container>
          <Header
            title="Dashboard de Produção"
            subtitle="Sistema de Gestão Florestal - NOBRE FLORESTAL"
          />

          <div className="h-6" />

          <FilterBar tipo="derruba" />

          <div className="h-6" />

          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KpiCard
              title="Produção Geral"
              value={dashboard.indicadores.producaoTotal.toLocaleString("pt-BR")}
              icon={<Trees size={22} />}
            />

            <KpiCard
              title="Operadores Ativos"
              value={dashboard.indicadores.operadores.toLocaleString("pt-BR")}
              icon={<Users size={22} />}
            />

            <KpiCard
              title="Dias Trabalhados"
              value={dashboard.indicadores.dias.toLocaleString("pt-BR")}
              icon={<CalendarDays size={22} />}
            />

            <KpiCard
              title="Média por Dia"
              value={dashboard.indicadores.media.toLocaleString("pt-BR")}
              icon={<TrendingUp size={22} />}
            />

            <KpiCard
              title="Espécies Exploradas"
              value={dashboard.indicadores.especies.toLocaleString("pt-BR")}
              icon={<Leaf size={22} />}
            />
          </div>

          <div className="h-8" />

          {/* ================= Primeira Linha ================= */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <ChartCard title="Produção por Dia">
                <ProductionChart />
              </ChartCard>
            </div>

            <div className="xl:col-span-4">
              <ChartCard title="DESTAQUE">
                <RankingChart />
              </ChartCard>
            </div>
          </div>

          <div className="h-8" />

          {/* ================= Segunda Linha ================= */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <ChartCard title="Produção por UT">
              <UTChart />
            </ChartCard>

            <ChartCard title="Produção por Espécie">
              <SpeciesChart />
            </ChartCard>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}