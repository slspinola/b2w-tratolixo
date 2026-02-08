import { TrendingUp, TrendingDown, Minus, Euro, Package, Truck, Factory, Percent } from 'lucide-react';
import type { CfoMetrics } from '../../../mock-data/store.js';
import { formatCurrency, formatNumber } from '../../../utils/formatters.js';

interface DirectCostsSectionProps {
  metrics: CfoMetrics;
  selectedMunicipio: string | null;
}

interface KpiCardProps {
  label: string;
  value: string;
  variacao: number;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

function TrendBadge({ variacao }: { variacao: number }) {
  const isPositive = variacao > 0;
  const isNeutral = variacao === 0;
  const color = isNeutral
    ? 'var(--text-muted)'
    : isPositive
      ? 'var(--danger-default)'
      : 'var(--success-default)';

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

function KpiCard({ label, value, variacao, icon, badge }: KpiCardProps) {
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
          {badge}
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
        <TrendBadge variacao={variacao} />
      </div>
    </div>
  );
}

export function DirectCostsSection({ metrics, selectedMunicipio }: DirectCostsSectionProps) {
  const isMafra = selectedMunicipio === 'mafra';

  const mafraBadge = isMafra ? (
    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8B5CF6] text-white rounded-full">
      MAFRA
    </span>
  ) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Custo por Tonelada"
        value={formatCurrency(metrics.custoPorTon.valor)}
        variacao={metrics.custoPorTon.variacao_pct}
        icon={<Euro size={16} />}
      />
      <KpiCard
        label="Custo por Saco"
        value={formatCurrency(metrics.custoPorSaco.valor)}
        variacao={metrics.custoPorSaco.variacao_pct}
        icon={<Package size={16} />}
      />
      <KpiCard
        label="Custo por Rota"
        value={formatCurrency(
          metrics.costBreakdown.total_eur /
            Math.max(metrics.municipalityComparison.length * 12, 1),
        )}
        variacao={metrics.custoTotal.variacao_pct}
        icon={<Truck size={16} />}
        badge={mafraBadge}
      />
      <KpiCard
        label="Custo Tratamento"
        value={formatCurrency(metrics.costBreakdown.tratamento_eur)}
        variacao={metrics.custoTotal.variacao_pct * 0.8}
        icon={<Factory size={16} />}
      />
      <KpiCard
        label="Margem Operacional"
        value={`${formatNumber(metrics.margemOperacional.valor, 1)}%`}
        variacao={metrics.margemOperacional.variacao_pct}
        icon={<Percent size={16} />}
      />
    </div>
  );
}
