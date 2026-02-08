import { useMemo } from 'react';
import { store } from '../../../mock-data/store.js';
import { useFilterContext } from '../../../hooks/useFilterContext.tsx';
import { FilterBar } from '../../layout/FilterBar.tsx';
import { PageContainer } from '../../layout/PageContainer.tsx';
import { DirectCostsSection } from './DirectCostsSection.tsx';
import { EfficiencySection } from './EfficiencySection.tsx';
import { CostEvolution } from './CostEvolution.tsx';
import { CostComparison } from './CostComparison.tsx';
import { RevenueBreakdown } from './RevenueBreakdown.tsx';

const PERIODO_MAP: Record<string, string> = {
  mes: 'ultimos_6m',
  ytd: 'ytd',
  trimestre: 'ultimos_6m',
  ano: 'ultimos_12m',
};

export default function CfoDashboard() {
  const { filters } = useFilterContext();

  const metrics = useMemo(
    () =>
      store.getCfoMetrics({
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
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Sustentabilidade Economica
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Dashboard Financeiro — Custos, eficiencia e receita
            </p>
          </header>

          {/* Row 1: Direct cost KPIs */}
          <DirectCostsSection
            metrics={metrics}
            selectedMunicipio={filters.municipio}
          />

          {/* Row 2: Efficiency KPIs */}
          <EfficiencySection metrics={metrics} />

          {/* Row 3: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CostEvolution metrics={metrics} />
            <CostComparison metrics={metrics} />
          </div>

          {/* Row 4: Revenue Breakdown */}
          <RevenueBreakdown metrics={metrics} />
        </div>
      </PageContainer>
    </>
  );
}
