import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatMonth, formatNumber } from '../../../utils/formatters.js';

const PARISH_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#F97316', '#EC4899',
];

interface ParishTrendsChartProps {
  parishTrends: CouncillorMetrics['parishTrends'];
}

export function ParishTrendsChart({ parishTrends }: ParishTrendsChartProps) {
  // Top 8 parishes by average GIS score
  const topParishes = useMemo(() => {
    return [...parishTrends]
      .map((p) => ({
        ...p,
        avgScore: p.scores.reduce((s, sc) => s + sc.score, 0) / Math.max(p.scores.length, 1),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 8);
  }, [parishTrends]);

  // Transform data for Recharts: each month is a row, each parish is a column
  const chartData = useMemo(() => {
    if (topParishes.length === 0) return [];
    const months = topParishes[0].scores.map((s) => s.mes);
    return months.map((mes) => {
      const row: Record<string, string | number> = { mes, label: formatMonth(mes) };
      for (const parish of topParishes) {
        const s = parish.scores.find((sc) => sc.mes === mes);
        row[parish.nome] = s?.score ?? 0;
      }
      return row;
    });
  }, [topParishes]);

  return (
    <div className="rounded-[var(--b2s-radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={16} style={{ color: 'var(--primary-default)' }} aria-hidden="true" />
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          Evolucao ICD-GIS por Freguesia
        </h3>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Tendencia dos ultimos 3 meses (top 8 freguesias)
      </p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tickCount={6}
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
                    {payload
                      .sort((a, b) => (b.value as number) - (a.value as number))
                      .map((entry) => (
                        <div key={entry.dataKey as string} className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="truncate max-w-[120px]">{entry.name}</span>
                          <span className="font-medium text-[var(--text-primary)] tabular-nums ml-auto">
                            {formatNumber(entry.value as number, 1)}
                          </span>
                        </div>
                      ))}
                  </div>
                );
              }}
              cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              iconType="circle"
              iconSize={6}
            />
            {topParishes.map((parish, i) => (
              <Line
                key={parish.freguesia_id}
                type="monotone"
                dataKey={parish.nome}
                stroke={PARISH_COLORS[i % PARISH_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: PARISH_COLORS[i % PARISH_COLORS.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
