import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Shield } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatMonth, formatNumber } from '../../../utils/formatters.js';

interface QualityEvolutionProps {
  metrics: CouncillorMetrics;
}

export function QualityEvolution({ metrics }: QualityEvolutionProps) {
  // Calculate monthly quality data from parish trends
  const qualityData = useMemo(() => {
    if (metrics.parishTrends.length === 0) return [];
    const months = metrics.parishTrends[0].scores.map((s) => s.mes);

    return months.map((mes) => {
      // Average GIS score across all parishes for this month
      const scores = metrics.parishTrends
        .map((p) => p.scores.find((s) => s.mes === mes)?.score ?? 0)
        .filter((s) => s > 0);
      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      // Derive quality metric: inverse contamination proxy
      // GIS score already encodes quality (higher = better)
      const qualidade = avgScore;

      // Estimate contamination from average parish contamination
      const avgContam = metrics.parishScores.reduce((s, p) => s + p.taxaContaminacao, 0)
        / Math.max(metrics.parishScores.length, 1);
      // Add some monthly variation
      const monthIdx = months.indexOf(mes);
      const contamVariation = avgContam * (1 - monthIdx * 0.02); // slight improvement trend

      return {
        mes,
        label: formatMonth(mes),
        qualidade: Math.round(qualidade * 10) / 10,
        contaminacao: Math.round(contamVariation * 10) / 10,
        meta: 85, // PERSU 2030+ quality target
      };
    });
  }, [metrics]);

  return (
    <div className="rounded-[var(--b2s-radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={16} style={{ color: 'var(--primary-default)' }} aria-hidden="true" />
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          Evolucao da Qualidade
        </h3>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Indice de qualidade (ICD-GIS) e taxa de contaminacao
      </p>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={qualityData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-[var(--b2s-radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] px-3 py-2 text-[12px]">
                    <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
                    {payload.filter((e) => e.dataKey !== 'meta').map((entry) => (
                      <div key={entry.dataKey as string} className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}:</span>
                        <span className="font-medium text-[var(--text-primary)] tabular-nums">
                          {formatNumber(entry.value as number, 1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <ReferenceLine
              y={85}
              stroke="#8B5CF6"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{ value: 'Meta PERSU', position: 'insideTopRight', fontSize: 10, fill: '#8B5CF6' }}
            />
            <Area
              type="monotone"
              dataKey="qualidade"
              name="Qualidade (ICD-GIS)"
              stroke="#059669"
              strokeWidth={2}
              fill="rgba(5,150,105,0.12)"
              dot={false}
              activeDot={{ r: 4, fill: '#059669' }}
            />
            <Area
              type="monotone"
              dataKey="contaminacao"
              name="Contaminacao (%)"
              stroke="#EF4444"
              strokeWidth={2}
              fill="rgba(239,68,68,0.08)"
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
