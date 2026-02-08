import { useMemo } from 'react';
import { store } from '../../../mock-data/store.js';
import { useFilterContext } from '../../../hooks/useFilterContext.tsx';
import { FilterBar } from '../../layout/FilterBar.tsx';
import { PageContainer } from '../../layout/PageContainer.tsx';
import { DataOverview } from './DataOverview.tsx';
import { TrackTrace } from './TrackTrace.tsx';
import { ContaminationView } from './ContaminationView.tsx';
import { HistoryExplorer } from './HistoryExplorer.tsx';

const PERIODO_MAP: Record<string, string> = {
  mes: 'ultimos_6m',
  ytd: 'ytd',
  trimestre: 'ultimos_6m',
  ano: 'ultimos_12m',
};

export default function Bee2WasteDashboard() {
  const { filters } = useFilterContext();

  const metrics = useMemo(
    () =>
      store.getBee2WasteMetrics({
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
              Rastreabilidade
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Dashboard Bee2Waste — Controlo de dados e rastreabilidade da plataforma
            </p>
          </header>

          {/* Row 1: KPI Cards */}
          <DataOverview metrics={metrics} />

          {/* Row 2: Track & Trace */}
          <TrackTrace metrics={metrics} />

          {/* Row 3: Contamination Detection */}
          <ContaminationView metrics={metrics} />

          {/* Row 4: History Explorer */}
          <HistoryExplorer metrics={metrics} />
        </div>
      </PageContainer>
    </>
  );
}
