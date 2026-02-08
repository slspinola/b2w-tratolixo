import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Clock } from 'lucide-react';
import type { OperationalMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface HourlyChartProps {
  hourlyCollection: OperationalMetrics['hourlyCollection'];
}

export function HourlyChart({ hourlyCollection }: HourlyChartProps) {
  const data = useMemo(
    () =>
      hourlyCollection.map((h) => ({
        ...h,
        label: `${String(h.hora).padStart(2, '0')}h`,
      })),
    [hourlyCollection],
  );

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock size={16} style={{ color: 'var(--primary-default)' }} aria-hidden="true" />
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
          Recolha por Hora
        </h3>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Distribuicao horaria de sacos e peso recolhido (hoje)
      </p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-[var(--b2s-radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] px-3 py-2 text-[12px]">
                    <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
                    {payload.map((entry) => (
                      <div key={entry.dataKey as string} className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}:</span>
                        <span className="font-medium text-[var(--text-primary)] tabular-nums">
                          {formatNumber(entry.value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar yAxisId="left" dataKey="sacos" name="Sacos" fill="var(--primary-default)" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="peso_kg" name="Peso (kg)" fill="#22C55E" radius={[3, 3, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
