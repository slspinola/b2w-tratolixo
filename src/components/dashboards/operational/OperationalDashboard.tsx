import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { store } from '../../../mock-data/store.js';
import type { OperationalMetrics, CouncillorMetrics } from '../../../mock-data/store.js';
import { useFilterContext } from '../../../hooks/useFilterContext.tsx';
import { FilterBar } from '../../layout/FilterBar.tsx';
import { OperationsSection } from './OperationsSection.tsx';
import { QualitySection } from './QualitySection.tsx';
import { EfficiencySection } from './EfficiencySection.tsx';
import { HourlyChart } from './HourlyChart.tsx';
import { HeatMap } from './HeatMap.tsx';
import { RealTimeFeed } from './RealTimeFeed.tsx';

export default function OperationalDashboard() {
  const { filters } = useFilterContext();

  const metrics: OperationalMetrics = useMemo(
    () =>
      store.getOperationalMetrics({
        municipio: filters.municipio,
        data: new Date(),
        turno: filters.turno,
      }),
    [filters.municipio, filters.turno],
  );

  const councillorMetrics: CouncillorMetrics = useMemo(
    () =>
      store.getCouncillorMetrics({
        municipio: filters.municipio,
        periodo: 'ultimos_6m',
      }),
    [filters.municipio],
  );

  const isMafra = filters.municipio === 'mafra';
  const unresolvedAlerts = useMemo(
    () => metrics.activeAlerts.filter((a) => !a.resolvido),
    [metrics.activeAlerts],
  );
  const hasCriticalAlerts = unresolvedAlerts.some(
    (a) => a.severidade === 'critica' || a.severidade === 'alta',
  );

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <FilterBar
        showMunicipality
        showPeriod={false}
        showShift
        showExport
      />

      {/* Header */}
      <div className="px-1">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Operacional
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Dashboard de Operacoes — Recolha e controlo de qualidade
          {filters.turno && (
            <span className="ml-2 capitalize">
              — Turno: {filters.turno}
            </span>
          )}
        </p>
      </div>

      {/* Alert banner (conditional) */}
      {hasCriticalAlerts && (
        <AlertBanner
          count={unresolvedAlerts.length}
          criticalCount={
            unresolvedAlerts.filter(
              (a) => a.severidade === 'critica',
            ).length
          }
        />
      )}

      {/* Operations section (KPIs + routes) */}
      <OperationsSection metrics={metrics} isMafra={isMafra} />

      {/* Quality section (contamination gauge + donut + alerts) */}
      <QualitySection metrics={metrics} alerts={metrics.activeAlerts} />

      {/* Efficiency section (team + incidents + MTTR) */}
      <EfficiencySection metrics={metrics} />

      {/* Hourly collection chart */}
      <HourlyChart hourlyCollection={metrics.hourlyCollection} />

      {/* Heat map by parish */}
      <HeatMap metrics={councillorMetrics} />

      {/* Real-time feed */}
      <RealTimeFeed />
    </div>
  );
}

// ---- Alert Banner ----

function AlertBanner({
  count,
  criticalCount,
}: {
  count: number;
  criticalCount: number;
}) {
  return (
    <div
      className="
        flex items-center gap-3
        px-5 py-3
        rounded-[var(--b2s-radius-md)]
        animate-pulse
      "
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
      }}
      role="alert"
    >
      <AlertTriangle
        size={20}
        style={{ color: 'var(--danger-default)' }}
        aria-hidden="true"
        className="shrink-0"
      />
      <div className="flex-1">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--danger-default)' }}
        >
          {count} alerta{count !== 1 ? 's' : ''} ativo{count !== 1 ? 's' : ''}
        </span>
        {criticalCount > 0 && (
          <span
            className="text-xs ml-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            ({criticalCount} critico{criticalCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
      <span
        className="
          inline-flex items-center justify-center
          min-w-[24px] h-[24px] px-1.5
          text-xs font-bold text-white
          rounded-full
        "
        style={{ background: 'var(--danger-default)' }}
      >
        {count}
      </span>
    </div>
  );
}
