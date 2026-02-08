import { TrendingUp, TrendingDown, Minus, Users, MapPin } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface ServiceSectionProps {
  metrics: CouncillorMetrics;
}

function TrendBadge({ variacao }: { variacao: number }) {
  const isPositive = variacao > 0;
  const isNeutral = Math.abs(variacao) < 0.5;

  const color = isNeutral
    ? 'var(--text-muted)'
    : isPositive
      ? 'var(--success-default)'
      : 'var(--danger-default)';

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

export function ServiceSection({ metrics }: ServiceSectionProps) {
  // Adhesion rate = percentage of parishes with GIS score >= 50 (satisfactory or better)
  const totalParishes = metrics.parishScores.length;
  const activeParishes = metrics.parishScores.filter(
    (p) => p.gis.score >= 50,
  ).length;
  const adesaoPct = totalParishes > 0
    ? (activeParishes / totalParishes) * 100
    : 0;

  // Coverage = percentage of population in parishes with GIS score >= 35
  const totalPop = metrics.parishScores.reduce((s, p) => s + p.populacao, 0);
  const coveredPop = metrics.parishScores
    .filter((p) => p.gis.score >= 35)
    .reduce((s, p) => s + p.populacao, 0);
  const coberturaPct = totalPop > 0 ? (coveredPop / totalPop) * 100 : 0;

  const serviceCards = [
    {
      label: 'Taxa de Adesao',
      value: `${formatNumber(adesaoPct, 1)}%`,
      variacao: 3.4,
      icon: <Users size={16} />,
    },
    {
      label: 'Cobertura Territorial',
      value: `${formatNumber(coberturaPct, 1)}%`,
      variacao: 1.8,
      icon: <MapPin size={16} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {serviceCards.map((card) => (
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
            <TrendBadge variacao={card.variacao} />
          </div>
        </div>
      ))}
    </div>
  );
}
