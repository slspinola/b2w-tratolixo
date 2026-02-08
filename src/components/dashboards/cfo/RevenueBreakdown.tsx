import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CfoMetrics } from '../../../mock-data/store.js';
import { formatCurrency, formatNumber } from '../../../utils/formatters.js';

interface RevenueBreakdownProps {
  metrics: CfoMetrics;
}

export function RevenueBreakdown({ metrics }: RevenueBreakdownProps) {
  const data = useMemo(() => [
    { name: 'Composto', value: metrics.receitaComposto, fill: '#059669' },
    { name: 'Energia', value: metrics.receitaEnergia, fill: '#F59E0B' },
    { name: 'Reciclaveis', value: metrics.receitaReciclaveis, fill: '#3B82F6' },
  ], [metrics.receitaComposto, metrics.receitaEnergia, metrics.receitaReciclaveis]);

  return (
    <div className="rounded-[var(--b2s-radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
        Composicao da Receita
      </h3>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Reparticao por fonte de receita estimada
      </p>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={92}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-[var(--b2s-radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] px-3 py-2 text-[12px]">
                      <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-[var(--text-secondary)]">{formatCurrency(item.value as number)}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + values */}
        <div className="flex-1 space-y-3">
          {data.map((item) => {
            const pct = metrics.receitaTotal > 0 ? (item.value / metrics.receitaTotal) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-[12px] text-[var(--text-secondary)]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-1.5">
                    ({formatNumber(pct, 1)}%)
                  </span>
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">Total</span>
              <span className="text-[14px] font-bold text-[var(--text-primary)] tabular-nums">
                {formatCurrency(metrics.receitaTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
