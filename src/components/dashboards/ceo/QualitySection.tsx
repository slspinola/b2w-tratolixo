import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { KpiCard as KpiCardData, CeoMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatPercent, formatMonth } from '../../../utils/formatters.js';

// ---- Custom tooltip ----

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  name?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="
        rounded-[var(--b2s-radius-sm)]
        border border-[var(--border)]
        bg-[var(--bg-card)]
        shadow-[var(--shadow-md)]
        px-3 py-2
        text-[12px]
      "
    >
      <p className="font-semibold text-[var(--text-primary)] mb-1">
        {typeof label === 'string' && label.includes('-') ? formatMonth(label) : label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name ?? entry.dataKey}:</span>
          <span className="font-medium text-[var(--text-primary)] tabular-nums">
            {formatNumber(entry.value, 1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Gauge Chart (donut style) ----

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
}

function GaugeChart({ value, max = 30, label }: GaugeChartProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const remaining = max - clamped;

  // Colour based on contamination severity
  const gaugeColor = useMemo(() => {
    if (value <= 5) return '#059669';
    if (value <= 10) return '#10b981';
    if (value <= 15) return '#f59e0b';
    if (value <= 20) return '#f97316';
    return '#ef4444';
  }, [value]);

  const data = [
    { name: 'value', val: clamped },
    { name: 'remaining', val: remaining },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[200px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              startAngle={220}
              endAngle={-40}
              dataKey="val"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={gaugeColor} />
              <Cell fill="var(--bg-secondary)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[24px] font-bold tabular-nums leading-tight"
            style={{ color: gaugeColor }}
          >
            {formatNumber(value, 1)}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)]">%</span>
        </div>
      </div>
      <span className="text-[12px] font-medium text-[var(--text-primary)] mt-1">{label}</span>
    </div>
  );
}

// ---- Inline KPI card for rejection ----

function RejectionCard({ data }: { data: KpiCardData }) {
  const trendPositive = data.variacao_pct < 0; // lower rejection is better
  const trendNeutral = data.variacao_pct === 0;

  return (
    <div
      className="
        flex flex-col
        rounded-[var(--b2s-radius-md)]
        border border-[var(--border)]
        bg-[var(--bg-card)]
        shadow-[var(--shadow-sm)]
        p-4
      "
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-[var(--b2s-radius-sm)]"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
        >
          <XCircle size={16} color="var(--danger-default)" aria-hidden="true" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {data.label}
        </span>
      </div>

      <div className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mb-1">
        {formatPercent(data.valor)}
      </div>

      <div className="flex items-center gap-1.5">
        {trendNeutral ? (
          <Minus size={13} className="text-[var(--text-secondary)]" aria-hidden="true" />
        ) : trendPositive ? (
          <TrendingDown size={13} className="text-[var(--success-default)]" aria-hidden="true" />
        ) : (
          <TrendingUp size={13} className="text-[var(--danger-default)]" aria-hidden="true" />
        )}
        <span
          className="text-[11px] font-medium tabular-nums"
          style={{
            color: trendNeutral
              ? 'var(--text-secondary)'
              : trendPositive
                ? 'var(--success-default)'
                : 'var(--danger-default)',
          }}
        >
          {data.variacao_pct > 0 ? '+' : ''}
          {formatNumber(data.variacao_pct, 1)}%
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]">vs anterior</span>
      </div>
    </div>
  );
}

// ---- Top contamination types ----

const CONTAM_TYPES = [
  { label: 'Plastico', pct: 32, color: '#3B82F6' },
  { label: 'Vidro', pct: 24, color: '#22C55E' },
  { label: 'Papel/Cartao', pct: 18, color: '#F59E0B' },
  { label: 'Metal', pct: 14, color: '#8B5CF6' },
  { label: 'Outros', pct: 12, color: '#6B7280' },
];

function TopContaminationTypes() {
  return (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold text-[var(--text-primary)]">
        Principais Contaminantes
      </h4>
      {CONTAM_TYPES.map((ct) => (
        <div key={ct.label} className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-secondary)] w-24 truncate">{ct.label}</span>
          <div className="flex-1 h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${ct.pct}%`, backgroundColor: ct.color }}
            />
          </div>
          <span className="text-[11px] font-medium text-[var(--text-primary)] tabular-nums w-10 text-right">
            {ct.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Section ----

interface QualitySectionProps {
  taxaContaminacaoMedia: KpiCardData;
  taxaRejeicaoPct: KpiCardData;
  monthlyBreakdown: CeoMetrics['monthlyBreakdown'];
}

export default function QualitySection({
  taxaContaminacaoMedia,
  taxaRejeicaoPct,
  monthlyBreakdown,
}: QualitySectionProps) {
  // Monthly evolution data
  const evolutionData = useMemo(
    () =>
      monthlyBreakdown.map((m) => ({
        mes: m.mes,
        label: formatMonth(m.mes),
        contaminacao: m.contaminacao,
      })),
    [monthlyBreakdown],
  );

  return (
    <section aria-label="Qualidade e contaminacao" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: Gauge + Rejection KPI + contamination types */}
        <div
          className="
            rounded-[var(--b2s-radius-md)]
            border border-[var(--border)]
            bg-[var(--bg-card)]
            shadow-[var(--shadow-sm)]
            p-5
            space-y-5
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color="var(--warning-default)" aria-hidden="true" />
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
              Taxa de Contaminacao
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <GaugeChart
              value={taxaContaminacaoMedia.valor}
              label="Contaminacao Media"
            />
            <div className="flex-1 w-full space-y-4">
              <RejectionCard data={taxaRejeicaoPct} />
              <TopContaminationTypes />
            </div>
          </div>
        </div>

        {/* Right column: Monthly evolution line chart */}
        <div
          className="
            rounded-[var(--b2s-radius-md)]
            border border-[var(--border)]
            bg-[var(--bg-card)]
            shadow-[var(--shadow-sm)]
            p-5
          "
        >
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            Evolucao Mensal da Contaminacao
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mb-4">
            Taxa de contaminacao media ponderada por mes
          </p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, 'auto']}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
                />
                {/* Warning threshold line */}
                <Line
                  type="monotone"
                  dataKey="contaminacao"
                  name="Contaminacao"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
