import {
  Trees,
  CalendarDays,
  Leaf,
  TrendingUp,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";

import FilterBar from "../components/filters/FilterBar";

import KpiCard from "../components/cards/KpiCard";
import EstimativaMadeira from "../components/EstimativaMadeira";

import { useExcel } from "../hooks/useExcel";
import { useFilters } from "../context/FilterContext";

import { processDashboardData } from "../services/dataProcessor";

import {
  processarMedicao,
  calcularStatsMedicao,
} from "../processors/medicao";


export default function Medicao() {

  const { data } = useExcel();

  const { filters } = useFilters();


  const dashboard = processDashboardData(
    data,
    filters.medicao
  );


  const registros = processarMedicao(
    dashboard.medicao
  );


  const stats = calcularStatsMedicao(
    registros
  );


  return (

    <MainLayout>

      <div className="pt-8 w-full">

        <Container>


          <Header
            title="Dashboard de Medição"
            subtitle="Sistema de Gestão Florestal - NOBRE FLORESTAL"
          />


          <div className="h-6" />



          <FilterBar tipo="medicao" />


          <div className="h-8" />



          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-6
            "
          >


            <KpiCard
              title="Volume Comercial"
              value={stats.volumeComercial.toFixed(2)}
              icon={<TrendingUp size={28} />}
            />


            <KpiCard
              title="Árvores"
              value={stats.arvores}
              icon={<Trees size={28} />}
            />


            <KpiCard
              title="Dias"
              value={stats.dias}
              icon={<CalendarDays size={28} />}
            />


            <KpiCard
              title="UT's"
              value={stats.uts}
              icon={<TrendingUp size={28} />}
            />


            <KpiCard
              title="Média m³/Árvore"
              value={stats.mediaArvore.toFixed(3)}
              icon={<TrendingUp size={28} />}
            />


            <KpiCard
              title="Espécies"
              value={stats.especies}
              icon={<Leaf size={28} />}
            />


          </div>



          <div className="h-10" />



          <div
            className="
              w-full
              flex
              justify-center
            "
          >

            <EstimativaMadeira
              especies={dashboard.estimativaEspecies}
            />

          </div>



        </Container>


      </div>


    </MainLayout>

  );
}