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
import type { CfoMetrics } from '../../../mock-data/store.js';
import { formatCurrency } from '../../../utils/formatters.js';

interface CostEvolutionProps {
  metrics: CfoMetrics;
}

const COST_COLORS: Record<string, string> = {
  recolha: '#3B82F6',
  tratamento: '#22C55E',
  transporte: '#F59E0B',
  mao_obra: '#8B5CF6',
  overhead: '#EC4899',
  total: 'var(--text-primary)',
};

const COST_LABELS: Record<string, string> = {
  recolha: 'Recolha',
  tratamento: 'Tratamento',
  transporte: 'Transporte',
  mao_obra: 'Mao de Obra',
  overhead: 'Overhead',
  total: 'Total',
};

function formatMonthLabel(mes: string): string {
  const [year, month] = mes.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] ?? month} ${year?.slice(2)}`;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
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
        {label ? formatMonthLabel(label) : ''}
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
              {COST_LABELS[entry.dataKey] ?? entry.dataKey}
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

export function CostEvolution({ metrics }: CostEvolutionProps) {
  const chartData = useMemo(
    () =>
      metrics.monthlyCosts.map((mc) => ({
        ...mc,
        label: formatMonthLabel(mc.mes),
      })),
    [metrics.monthlyCosts],
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
        Evolucao de Custos
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke={COST_COLORS.total}
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="recolha"
            name="Recolha"
            stroke={COST_COLORS.recolha}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
          <Line
            type="monotone"
            dataKey="tratamento"
            name="Tratamento"
            stroke={COST_COLORS.tratamento}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
          <Line
            type="monotone"
            dataKey="transporte"
            name="Transporte"
            stroke={COST_COLORS.transporte}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
          <Line
            type="monotone"
            dataKey="mao_obra"
            name="Mao de Obra"
            stroke={COST_COLORS.mao_obra}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
