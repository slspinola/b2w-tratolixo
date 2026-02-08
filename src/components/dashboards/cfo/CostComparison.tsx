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
import type { CfoMetrics } from '../../../mock-data/store.js';
import { formatCurrency, formatNumber } from '../../../utils/formatters.js';

interface CostComparisonProps {
  metrics: CfoMetrics;
}

const MUNICIPALITY_COLORS: Record<string, string> = {
  cascais: '#3B82F6',
  sintra: '#22C55E',
  oeiras: '#F59E0B',
  mafra: '#8B5CF6',
};

const BAR_COLORS = {
  custo: '#3B82F6',
  receita: '#22C55E',
  bio: '#F59E0B',
};

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-[var(--b2s-radius-sm)] p-3 text-xs"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p
        className="font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: entry.color }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {entry.name}
            </span>
          </span>
          <span
            className="font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CostComparison({ metrics }: CostComparisonProps) {
  const chartData = useMemo(
    () =>
      metrics.municipalityComparison.map((mc) => ({
        nome: mc.nome,
        custo_total: mc.custo_total_eur,
        custo_por_ton: mc.custo_por_ton_eur,
        bio_ton: mc.bio_ton,
        receita: mc.receita_estimada_eur,
        municipio_id: mc.municipio_id,
      })),
    [metrics.municipalityComparison],
  );

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Comparacao por Municipio
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="nome"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k €`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          />
          <Bar
            dataKey="custo_total"
            name="Custo Total"
            fill={BAR_COLORS.custo}
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
          <Bar
            dataKey="receita"
            name="Receita"
            fill={BAR_COLORS.receita}
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Municipality summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th
                className="text-left py-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Municipio
              </th>
              <th
                className="text-right py-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Bio (ton)
              </th>
              <th
                className="text-right py-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Custo/Ton
              </th>
              <th
                className="text-right py-2 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Margem
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.municipalityComparison.map((mc) => (
              <tr
                key={mc.municipio_id}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="py-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          MUNICIPALITY_COLORS[mc.municipio_id] ??
                          'var(--primary-default)',
                      }}
                    />
                    {mc.nome}
                  </span>
                </td>
                <td
                  className="text-right py-2 font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatNumber(mc.bio_ton, 1)} t
                </td>
                <td
                  className="text-right py-2 font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatCurrency(mc.custo_por_ton_eur)}
                </td>
                <td
                  className="text-right py-2 font-medium"
                  style={{
                    color:
                      mc.margem_pct >= 0
                        ? 'var(--success-default)'
                        : 'var(--danger-default)',
                  }}
                >
                  {formatNumber(mc.margem_pct, 1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
