import {
  Trees,
  Users,
  CalendarDays,
  Leaf,
  TrendingUp,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";

import FilterBar from "../components/filters/FilterBar";

import KpiCard from "../components/cards/KpiCard";

import ProductionChart from "../components/charts/arraste/ProductionChart";
import RankingChart from "../components/charts/arraste/RankingChart";
import UTChart from "../components/charts/arraste/UTChart";
import MotivoChart from "../components/charts/arraste/MotivoChart";

import { useExcel } from "../hooks/useExcel";
import { useFilters } from "../context/FilterContext";

import { processDashboardData } from "../services/dataProcessor";

import {
  processarArraste,
  calcularStatsArraste,
} from "../processors/arraste";

export default function Arraste() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  const registros = processarArraste(dashboard.arraste);

  // ESTA LINHA ESTAVA FALTANDO
  const stats = calcularStatsArraste(registros);

  const mediaDiaria =
    stats.dias > 0
      ? (stats.producaoTotal / stats.dias).toFixed(1)
      : "0";

  return (
    <MainLayout>
      <div className="pt-8">
        <Container>
          <Header
            title="Dashboard de Arraste"
            subtitle="Sistema de Gestão Florestal - NOBRE FLORESTAL"
          />

          <div className="h-6" />

          <FilterBar tipo="arraste" />

          <div className="h-8" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <KpiCard
              title="Árvores Arrastadas"
              value={stats.producaoTotal}
              icon={<Trees size={28} />}
            />

            <KpiCard
              title="Operadores"
              value={stats.operadores}
              icon={<Users size={28} />}
            />

            <KpiCard
              title="Dias Trabalhados"
              value={stats.dias}
              icon={<CalendarDays size={28} />}
            />

            <KpiCard
              title="UT's"
              value={stats.uts}
              icon={<TrendingUp size={28} />}
            />

            <KpiCard
              title="Média Diária"
              value={mediaDiaria}
              icon={<TrendingUp size={28} />}
            />

            <KpiCard
              title="Espécies"
              value={stats.especies}
              icon={<Leaf size={28} />}
            />
          </div>

          <div className="h-8" />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ProductionChart />
            <RankingChart />
          </div>

          <div className="h-6" />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <UTChart />
            <MotivoChart />
          </div>

          <div className="h-10" />
        </Container>
      </div>
    </MainLayout>
  );
}