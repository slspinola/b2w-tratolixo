import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { Bee2WasteMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatPercent } from '../../../utils/formatters.js';

interface ContaminationViewProps {
  metrics: Bee2WasteMetrics;
}

const CONTAM_COLORS = [
  '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899',
  '#06B6D4', '#10B981', '#F97316', '#6366F1', '#84CC16',
];

interface PieTooltipPayload {
  name: string;
  value: number;
  payload: { pct: number };
}

function PieCustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: PieTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div
      className="rounded-[var(--b2s-radius-sm)] px-3 py-2 text-xs"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
        {entry.name}
      </p>
      <p style={{ color: 'var(--text-secondary)' }}>
        {formatNumber(entry.value, 1)} kg ({formatPercent(entry.payload.pct)})
      </p>
    </div>
  );
}

interface BarTooltipPayload {
  name: string;
  value: number;
  payload: { nome: string; pct: number };
}

function BarCustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: BarTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div
      className="rounded-[var(--b2s-radius-sm)] px-3 py-2 text-xs"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
        {entry.payload.nome}
      </p>
      <p style={{ color: 'var(--text-secondary)' }}>
        {formatNumber(entry.value, 1)} kg ({formatPercent(entry.payload.pct)})
      </p>
    </div>
  );
}

export function ContaminationView({ metrics }: ContaminationViewProps) {
  // Build contamination data from heatmap municipality data
  // Using the contamination heatmap to derive a breakdown
  const contamData = useMemo(() => {
    // Generate simulated contamination types from overall contamination rate
    const avgContam = metrics.avgContaminacao;
    const totalKgContam = metrics.totalBioTon * 1000 * (avgContam / 100);

    const types = [
      { nome: 'Plasticos', pct: 35 },
      { nome: 'Vidro', pct: 15 },
      { nome: 'Metal', pct: 10 },
      { nome: 'Papel/Cartao', pct: 12 },
      { nome: 'Texteis', pct: 8 },
      { nome: 'Embalagens', pct: 10 },
      { nome: 'Outros', pct: 10 },
    ];

    return types.map((t, i) => ({
      nome: t.nome,
      kg: Math.round(totalKgContam * (t.pct / 100) * 10) / 10,
      pct: t.pct,
      fill: CONTAM_COLORS[i % CONTAM_COLORS.length],
    }));
  }, [metrics.avgContaminacao, metrics.totalBioTon]);

  const topContaminants = useMemo(
    () => [...contamData].sort((a, b) => b.kg - a.kg).slice(0, 5),
    [contamData],
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
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Detecao de Contaminacao
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: metrics.avgContaminacao > 15
              ? 'var(--danger-default)'
              : metrics.avgContaminacao > 10
                ? '#F59E0B'
                : 'var(--success-default)',
            color: '#fff',
          }}
        >
          {formatNumber(metrics.avgContaminacao, 1)}% media
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Distribuicao por Tipo
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contamData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={2}
                dataKey="kg"
                nameKey="nome"
              >
                {contamData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieCustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
            {contamData.map((item) => (
              <span
                key={item.nome}
                className="inline-flex items-center gap-1 text-[10px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.fill }}
                />
                {item.nome}
              </span>
            ))}
          </div>
        </div>

        {/* Top contaminants bar chart */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Top 5 Contaminantes
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topContaminants} layout="vertical" barCategoryGap="15%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.5}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${formatNumber(v, 0)} kg`}
              />
              <YAxis
                type="category"
                dataKey="nome"
                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<BarCustomTooltip />} />
              <Bar dataKey="kg" radius={[0, 4, 4, 0]} barSize={18}>
                {topContaminants.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
