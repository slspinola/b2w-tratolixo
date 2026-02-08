import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatTrend } from '../../../utils/formatters.ts';
import { SparklineChart } from '../charts/SparklineChart.tsx';

interface KpiCardProps {
  label: string;
  valor: number;
  unidade: string;
  variacao_pct: number;
  sparkline?: { mes: string; valor: number }[];
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  valor,
  unidade,
  variacao_pct,
  sparkline,
  icon,
  className = '',
}: KpiCardProps) {
  const isPositive = variacao_pct >= 0;
  const trendColor = isPositive
    ? 'var(--success-default)'
    : 'var(--danger-default)';

  return (
    <article
      className={`
        flex flex-col gap-3 p-3 sm:p-4 lg:p-5
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
        shadow-[var(--shadow-sm)]
        transition-shadow duration-150
        hover:shadow-[var(--shadow-md)]
        ${className}
      `}
      aria-label={`${label}: ${formatNumber(valor)} ${unidade}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--text-secondary)] leading-snug">
          {label}
        </span>
        {icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-[var(--b2s-radius-sm)] bg-[var(--primary-surface)] text-[var(--primary-default)]">
            {icon}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-none text-[var(--text-primary)]">
          {formatNumber(valor)}
        </span>
        <span className="text-[13px] font-medium text-[var(--text-muted)]">
          {unidade}
        </span>
      </div>

      {/* Trend row */}
      <div className="flex items-center gap-1.5" style={{ color: trendColor }}>
        {isPositive ? (
          <TrendingUp size={14} strokeWidth={2} aria-hidden="true" />
        ) : (
          <TrendingDown size={14} strokeWidth={2} aria-hidden="true" />
        )}
        <span className="text-[12px] font-semibold">
          {formatTrend(variacao_pct)}
        </span>
        <span className="text-xs text-[var(--text-muted)] ml-1">
          vs. per. anterior
        </span>
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-1">
          <SparklineChart data={sparkline} height={48} />
        </div>
      )}
    </article>
  );
}
