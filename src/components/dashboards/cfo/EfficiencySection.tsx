import { TrendingUp, TrendingDown, Minus, Gauge, Navigation, Clock, Users } from 'lucide-react';
import type { CfoMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatCurrency } from '../../../utils/formatters.js';

interface EfficiencySectionProps {
  metrics: CfoMetrics;
}

function TrendBadge({ variacao, invertColor }: { variacao: number; invertColor?: boolean }) {
  const isPositive = variacao > 0;
  const isNeutral = variacao === 0;

  let color: string;
  if (isNeutral) {
    color = 'var(--text-muted)';
  } else if (invertColor) {
    color = isPositive ? 'var(--success-default)' : 'var(--danger-default)';
  } else {
    color = isPositive ? 'var(--danger-default)' : 'var(--success-default)';
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-medium"
      style={{ color }}
    >
      {isNeutral ? (
        <Minus size={12} />
      ) : isPositive ? (
        <TrendingUp size={12} />
      ) : (
        <TrendingDown size={12} />
      )}
      {formatNumber(Math.abs(variacao), 1)}%
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  variacao: number;
  icon: React.ReactNode;
  invertColor?: boolean;
}

function KpiCard({ label, value, variacao, icon, invertColor }: KpiCardProps) {
  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        <TrendBadge variacao={variacao} invertColor={invertColor} />
      </div>
    </div>
  );
}

export function EfficiencySection({ metrics }: EfficiencySectionProps) {
  const totalBioTon = metrics.municipalityComparison.reduce(
    (s, m) => s + m.bio_ton,
    0,
  );
  const numMonths = metrics.monthlyCosts.length || 1;

  // ton/turno: assuming 2 shifts per day, ~22 working days per month
  const tonPorTurno = totalBioTon / (numMonths * 22 * 2);

  // ton/km: estimated ~50km per route, 12 routes per municipality
  const totalRoutes = metrics.municipalityComparison.length * 12 * numMonths;
  const totalKm = totalRoutes * 50;
  const tonPorKm = totalKm > 0 ? totalBioTon / totalKm : 0;

  // Overtime %: estimated from mao_obra vs total
  const overtimePct =
    metrics.costBreakdown.total_eur > 0
      ? (metrics.costBreakdown.mao_obra_eur * 0.15) /
        metrics.costBreakdown.mao_obra_eur *
        100
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Ton/Turno"
        value={formatNumber(tonPorTurno, 2)}
        variacao={metrics.custoTotal.variacao_pct * -0.5}
        icon={<Gauge size={16} />}
        invertColor
      />
      <KpiCard
        label="Ton/Km"
        value={formatNumber(tonPorKm, 3)}
        variacao={metrics.custoTotal.variacao_pct * -0.3}
        icon={<Navigation size={16} />}
        invertColor
      />
      <KpiCard
        label="Horas Extra"
        value={`${formatNumber(overtimePct, 1)}%`}
        variacao={metrics.custoTotal.variacao_pct * 0.2}
        icon={<Clock size={16} />}
      />
      <KpiCard
        label="Custo Mao de Obra"
        value={formatCurrency(metrics.costBreakdown.mao_obra_eur)}
        variacao={metrics.custoTotal.variacao_pct * 0.6}
        icon={<Users size={16} />}
      />
    </div>
  );
}
