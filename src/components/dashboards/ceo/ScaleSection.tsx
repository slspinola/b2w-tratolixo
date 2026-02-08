import { useMemo, type ReactNode } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Weight,
  BarChart3,
  Percent,
  Package,
  Box,
  MapPin,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import type { KpiCard as KpiCardData, CeoMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatPercent, formatTons } from '../../../utils/formatters.js';
import MunicipalityComparison from './MunicipalityComparison.tsx';

// ---- Inline KPI Card ----

interface InlineKpiCardProps {
  data: KpiCardData;
  icon: ReactNode;
  formatter?: (n: number) => string;
  invertTrend?: boolean;
}

function InlineKpiCard({ data, icon, formatter, invertTrend = false }: InlineKpiCardProps) {
  const formatted = useMemo(() => {
    if (formatter) return formatter(data.valor);
    return formatNumber(data.valor, 1);
  }, [data.valor, formatter]);

  const trendPositive = invertTrend
    ? data.variacao_pct < 0
    : data.variacao_pct > 0;
  const trendNeutral = data.variacao_pct === 0;

  return (
    <div
      className="
        flex flex-col
        rounded-[var(--b2s-radius-md)]
        border border-[var(--border)]
        bg-[var(--bg-card)]
        shadow-[var(--shadow-sm)]
        p-4
        min-w-0
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-[var(--b2s-radius-sm)]"
          style={{ backgroundColor: 'var(--primary-surface)' }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] truncate">
          {data.label}
        </span>
      </div>

      {/* Value */}
      <div className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mb-1">
        {formatted}
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        {trendNeutral ? (
          <Minus size={13} className="text-[var(--text-secondary)]" aria-hidden="true" />
        ) : trendPositive ? (
          <TrendingUp size={13} className="text-[var(--success-default)]" aria-hidden="true" />
        ) : (
          <TrendingDown size={13} className="text-[var(--danger-default)]" aria-hidden="true" />
        )}
        <span
          className="text-[11px] font-medium tabular-nums"
          style={{
            color: trendNeutral
              ? 'var(--text-secondary)'
              : trendPositive
                ? 'var(--success-default)'
                : 'var(--danger-default)',
          }}
        >
          {data.variacao_pct > 0 ? '+' : ''}
          {formatNumber(data.variacao_pct, 1)}%
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]">vs periodo anterior</span>
      </div>

      {/* Sparkline */}
      {data.sparkline.length > 1 && (
        <div className="h-8 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.sparkline}
              margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
            >
              <Area
                type="monotone"
                dataKey="valor"
                stroke={trendPositive ? 'var(--success-default)' : 'var(--danger-default)'}
                strokeWidth={1.5}
                fill={trendPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---- Scale Section ----

interface ScaleSectionProps {
  totalBioTon: KpiCardData;
  crescimentoPct: KpiCardData;
  percentBioRU: KpiCardData;
  totalSacos: KpiCardData;
  volumeM3: KpiCardData;
  coberturaServico: KpiCardData;
  municipalityComparison: CeoMetrics['municipalityComparison'];
}

export default function ScaleSection({
  totalBioTon,
  crescimentoPct,
  percentBioRU,
  totalSacos,
  volumeM3,
  coberturaServico,
  municipalityComparison,
}: ScaleSectionProps) {
  const iconSize = 16;
  const iconColor = 'var(--primary-default)';

  return (
    <section aria-label="Escala e volume" className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <InlineKpiCard
          data={totalBioTon}
          icon={<Weight size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatTons(n)}
        />
        <InlineKpiCard
          data={crescimentoPct}
          icon={<BarChart3 size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatPercent(n)}
        />
        <InlineKpiCard
          data={percentBioRU}
          icon={<Percent size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatPercent(n)}
        />
        <InlineKpiCard
          data={totalSacos}
          icon={<Package size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatNumber(n)}
        />
        <InlineKpiCard
          data={volumeM3}
          icon={<Box size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => `${formatNumber(n, 1)} m\u00B3`}
        />
        <InlineKpiCard
          data={coberturaServico}
          icon={<MapPin size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatPercent(n)}
        />
      </div>

      {/* Municipality comparison chart */}
      <MunicipalityComparison data={municipalityComparison} />
    </section>
  );
}
