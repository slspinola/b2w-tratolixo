import { useMemo } from 'react';
import { store } from '../../../mock-data/store.js';
import { useFilterContext } from '../../../hooks/useFilterContext.tsx';
import { FilterBar } from '../../layout/FilterBar.tsx';
import { PageContainer } from '../../layout/PageContainer.tsx';
import { ImpactSection } from './ImpactSection.tsx';
import { ServiceSection } from './ServiceSection.tsx';
import { ParishTrendsChart } from './ParishTrendsChart.tsx';
import { QualityEvolution } from './QualityEvolution.tsx';
import { HeatMap } from '../operational/HeatMap.tsx';
import { NationalTargets } from './NationalTargets.tsx';
import { ContaminationByType } from './ContaminationByType.tsx';

const PERIODO_MAP: Record<string, string> = {
  mes: 'ultimos_6m',
  ytd: 'ytd',
  trimestre: 'ultimos_6m',
  ano: 'ultimos_12m',
};

export default function CouncillorDashboard() {
  const { filters } = useFilterContext();

  const metrics = useMemo(
    () =>
      store.getCouncillorMetrics({
        municipio: filters.municipio,
        periodo: PERIODO_MAP[filters.periodo] ?? 'ultimos_6m',
      }),
    [filters.municipio, filters.periodo],
  );

  return (
    <>
      <FilterBar
        showMunicipality
        showPeriod
        showShift={false}
        showExport
      />

      <PageContainer>
        <div className="space-y-6">
          <header>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Impacto Territorial
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Dashboard Autarquico — Politica publica, metas ambientais e transparencia
            </p>
          </header>

          {/* Row 1: Impact KPIs */}
          <ImpactSection metrics={metrics} />

          {/* Row 2: Service KPIs */}
          <ServiceSection metrics={metrics} />

          {/* Row 3: Parish trends + Quality evolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParishTrendsChart parishTrends={metrics.parishTrends} />
            <QualityEvolution metrics={metrics} />
          </div>

          {/* Row 4: Map + Parish Ranking */}
          <HeatMap metrics={metrics} />

          {/* Row 5: National Targets */}
          <NationalTargets metrics={metrics} />

          {/* Row 6: Contamination breakdown */}
          <ContaminationByType data={metrics.contaminacaoPorTipo} />
        </div>
      </PageContainer>
    </>
  );
}
