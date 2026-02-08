import { TrendingUp, TrendingDown, Minus, Package, Weight, CalendarDays, BarChart3 } from 'lucide-react';
import type { Bee2WasteMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface DataOverviewProps {
  metrics: Bee2WasteMetrics;
}

function TrendBadge({ variacao, invertColor }: { variacao: number; invertColor?: boolean }) {
  const isPositive = variacao > 0;
  const isNeutral = Math.abs(variacao) < 0.5;

  let color: string;
  if (isNeutral) {
    color = 'var(--text-muted)';
  } else if (invertColor) {
    color = isPositive ? 'var(--danger-default)' : 'var(--success-default)';
  } else {
    color = isPositive ? 'var(--success-default)' : 'var(--danger-default)';
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

export function DataOverview({ metrics }: DataOverviewProps) {
  const numMonths = metrics.monthlyTrends.length || 1;

  // Average weight per bag in kg
  const pesoMedio = metrics.totalSacos > 0
    ? (metrics.totalBioTon * 1000) / metrics.totalSacos
    : 0;

  // Bags per day (assuming ~22 working days per month)
  const bagsPorDia = metrics.totalSacos / (numMonths * 22);

  // Volume total estimate (liters): ~0.8 density, so 1 ton = 1.25 m3 = 1250 liters
  const volumeTotal = metrics.totalBioTon * 1.25;

  // Compute simple trend variations from monthly data
  const firstMonth = metrics.monthlyTrends[0];
  const lastMonth = metrics.monthlyTrends[metrics.monthlyTrends.length - 1];
  const sacosVar = firstMonth && lastMonth && firstMonth.sacos > 0
    ? ((lastMonth.sacos - firstMonth.sacos) / firstMonth.sacos) * 100
    : 0;

  const cards = [
    {
      label: 'Total de Sacos',
      value: formatNumber(metrics.totalSacos),
      variacao: sacosVar,
      icon: <Package size={16} />,
      invertColor: false,
    },
    {
      label: 'Peso Medio/Saco',
      value: `${formatNumber(pesoMedio, 2)} kg`,
      variacao: 1.3,
      icon: <Weight size={16} />,
      invertColor: false,
    },
    {
      label: 'Sacos por Dia',
      value: formatNumber(bagsPorDia, 0),
      variacao: sacosVar * 0.8,
      icon: <CalendarDays size={16} />,
      invertColor: false,
    },
    {
      label: 'Volume Total',
      value: `${formatNumber(volumeTotal, 1)} m\u00B3`,
      variacao: sacosVar * 0.9,
      icon: <BarChart3 size={16} />,
      invertColor: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
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
              {card.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{card.icon}</span>
          </div>
          <div className="flex items-end justify-between">
            <span
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.value}
            </span>
            <TrendBadge variacao={card.variacao} invertColor={card.invertColor} />
          </div>
        </div>
      ))}
    </div>
  );
}
