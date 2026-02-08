import { useMemo } from 'react';
import { useFilterContext } from '../../../hooks/useFilterContext.tsx';
import { store } from '../../../mock-data/store.js';
import { FilterBar } from '../../layout/FilterBar.tsx';
import { PageContainer } from '../../layout/PageContainer.tsx';
import SemaphoreHero from './SemaphoreHero.tsx';
import ScaleSection from './ScaleSection.tsx';
import EnvironmentalSection from './EnvironmentalSection.tsx';
import QualitySection from './QualitySection.tsx';

// ---- Period mapping ----

const PERIOD_MAP: Record<string, string> = {
  mes: 'ultimos_6m',
  ytd: 'ytd',
  trimestre: 'ultimos_6m',
  ano: 'ultimos_12m',
};

// ---- Component ----

export default function CeoDashboard() {
  const { filters } = useFilterContext();

  const storePeriodo = PERIOD_MAP[filters.periodo] ?? 'ultimos_6m';

  const metrics = useMemo(
    () =>
      store.getCeoMetrics({
        municipio: filters.municipio,
        periodo: storePeriodo,
      }),
    [filters.municipio, storePeriodo],
  );

  return (
    <>
      {/* FilterBar sits above the page container */}
      <FilterBar
        showMunicipality
        showPeriod
        showShift={false}
        showExport
      />

      <PageContainer>
        <div className="space-y-6">
          {/* Page header */}
          <header>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Desempenho Global
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Dashboard Executivo — Visao estrategica do sistema de biorresiduos
            </p>
          </header>

          {/* Row 1: Semaphore hero cards */}
          <SemaphoreHero semaforos={metrics.semaforos} />

          {/* Row 2: Scale & Volume KPIs + Municipality Comparison */}
          <ScaleSection
            totalBioTon={metrics.totalBioTon}
            crescimentoPct={metrics.crescimentoPct}
            percentBioRU={metrics.percentBioRU}
            totalSacos={metrics.totalSacos}
            volumeM3={metrics.volumeM3}
            coberturaServico={metrics.coberturaServico}
            municipalityComparison={metrics.municipalityComparison}
          />

          {/* Row 3: Environmental KPIs + CO2 Evolution + Production Breakdown */}
          <EnvironmentalSection
            co2EvitadoTon={metrics.co2EvitadoTon}
            desvioAterroPct={metrics.desvioAterroPct}
            compostoTon={metrics.compostoTon}
            biogasM3={metrics.biogasM3}
            energiaKwh={metrics.energiaKwh}
            monthlyBreakdown={metrics.monthlyBreakdown}
          />

          {/* Row 4: Quality & Contamination */}
          <QualitySection
            taxaContaminacaoMedia={metrics.taxaContaminacaoMedia}
            taxaRejeicaoPct={metrics.taxaRejeicaoPct}
            monthlyBreakdown={metrics.monthlyBreakdown}
          />
        </div>
      </PageContainer>
    </>
  );
}
