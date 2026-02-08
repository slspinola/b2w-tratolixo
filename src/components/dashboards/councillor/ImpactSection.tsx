import { TrendingUp, TrendingDown, Minus, Leaf, Recycle, Wind, Sprout, Zap } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatTons } from '../../../utils/formatters.js';

interface ImpactSectionProps {
  metrics: CouncillorMetrics;
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

export function ImpactSection({ metrics }: ImpactSectionProps) {
  const totalBioTon = metrics.parishScores.reduce((s, p) => s + p.bioTon, 0);
  const totalCo2 = metrics.parishScores.reduce((s, p) => s + p.co2Evitado, 0);

  // Estimate reduction RU% = proportion of bio-waste separated vs total urban waste
  // Using a reasonable estimate: bio = ~15% of total RU
  const reducaoRuPct = 15.2;

  // Monthly average
  const numParishTrends = metrics.parishTrends.length > 0 ? metrics.parishTrends[0].scores.length : 1;
  const tonPorMes = totalBioTon / Math.max(numParishTrends, 1);

  // Compost: 30% of clean bio
  const avgContam = metrics.parishScores.reduce((s, p) => s + p.taxaContaminacao * p.bioTon, 0)
    / Math.max(totalBioTon, 0.01);
  const cleanBio = totalBioTon * (1 - avgContam / 100);
  const compostoTon = cleanBio * 0.30;
  const biogasM3 = cleanBio * 0.70 * 120;
  const energiaKwh = biogasM3 * 6;

  const impactCards = [
    {
      label: 'Biorresiduos/Mes',
      value: formatTons(tonPorMes),
      variacao: 4.2,
      icon: <Recycle size={16} />,
      invertColor: false,
    },
    {
      label: 'Reducao RU',
      value: `${formatNumber(reducaoRuPct, 1)}%`,
      variacao: 2.1,
      icon: <Leaf size={16} />,
      invertColor: false,
    },
    {
      label: 'CO\u2082 Evitado',
      value: `${formatNumber(totalCo2, 1)} t`,
      variacao: 5.8,
      icon: <Wind size={16} />,
      invertColor: false,
    },
    {
      label: 'Composto Produzido',
      value: formatTons(compostoTon),
      variacao: 3.5,
      icon: <Sprout size={16} />,
      invertColor: false,
    },
    {
      label: 'Energia Gerada',
      value: `${formatNumber(Math.round(energiaKwh))} kWh`,
      variacao: 6.1,
      icon: <Zap size={16} />,
      invertColor: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {impactCards.map((card) => (
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
