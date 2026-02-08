import { useMemo, type ReactNode } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Leaf,
  Recycle,
  Sprout,
  Flame,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { KpiCard as KpiCardData, CeoMetrics } from '../../../mock-data/store.js';
import { formatNumber, formatPercent, formatTons, formatMonth } from '../../../utils/formatters.js';

// ---- Inline KPI Card (Environmental variant) ----

interface EnvKpiCardProps {
  data: KpiCardData;
  icon: ReactNode;
  formatter?: (n: number) => string;
}

function EnvKpiCard({ data, icon, formatter }: EnvKpiCardProps) {
  const formatted = useMemo(() => {
    if (formatter) return formatter(data.valor);
    return formatNumber(data.valor, 1);
  }, [data.valor, formatter]);

  const trendPositive = data.variacao_pct > 0;
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
        min-w-0
      "
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-[var(--b2s-radius-sm)]"
          style={{ backgroundColor: 'var(--primary-surface)' }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] truncate">
          {data.label}
        </span>
      </div>

      <div className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums leading-tight mb-1">
        {formatted}
      </div>

      <div className="flex items-center gap-1.5">
        {trendNeutral ? (
          <Minus size={13} className="text-[var(--text-secondary)]" aria-hidden="true" />
        ) : trendPositive ? (
          <TrendingUp size={13} className="text-[var(--success-default)]" aria-hidden="true" />
        ) : (
          <TrendingDown size={13} className="text-[var(--danger-default)]" aria-hidden="true" />
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
      </div>
    </div>
  );
}

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
            {formatNumber(entry.value, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Section ----

interface EnvironmentalSectionProps {
  co2EvitadoTon: KpiCardData;
  desvioAterroPct: KpiCardData;
  compostoTon: KpiCardData;
  biogasM3: KpiCardData;
  energiaKwh: KpiCardData;
  monthlyBreakdown: CeoMetrics['monthlyBreakdown'];
}

export default function EnvironmentalSection({
  co2EvitadoTon,
  desvioAterroPct,
  compostoTon,
  biogasM3,
  energiaKwh,
  monthlyBreakdown,
}: EnvironmentalSectionProps) {
  const iconSize = 16;
  const iconColor = 'var(--success-default)';

  // CO2 evolution data (area chart)
  const co2Data = useMemo(
    () =>
      monthlyBreakdown.map((m) => ({
        mes: m.mes,
        label: formatMonth(m.mes),
        co2: m.co2Evitado,
      })),
    [monthlyBreakdown],
  );

  // Production breakdown (stacked bar)
  const productionData = useMemo(
    () =>
      monthlyBreakdown.map((m) => {
        const cleanBio = m.bioTon * (1 - m.contaminacao / 100);
        return {
          mes: m.mes,
          label: formatMonth(m.mes),
          composto: Math.round(cleanBio * 0.3 * 10) / 10,
          digestato: Math.round(cleanBio * 0.4 * 10) / 10,
          biogas: Math.round(cleanBio * 0.7 * 120 / 1000 * 10) / 10, // in thousands m3
        };
      }),
    [monthlyBreakdown],
  );

  return (
    <section aria-label="KPIs Ambientais" className="space-y-4">
      {/* Environmental KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <EnvKpiCard
          data={co2EvitadoTon}
          icon={<Leaf size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => `${formatNumber(n, 1)} tCO\u2082e`}
        />
        <EnvKpiCard
          data={desvioAterroPct}
          icon={<Recycle size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatPercent(n)}
        />
        <EnvKpiCard
          data={compostoTon}
          icon={<Sprout size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => formatTons(n)}
        />
        <EnvKpiCard
          data={biogasM3}
          icon={<Flame size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => `${formatNumber(n)} m\u00B3`}
        />
        <EnvKpiCard
          data={energiaKwh}
          icon={<Zap size={iconSize} color={iconColor} aria-hidden="true" />}
          formatter={(n) => `${formatNumber(n)} kWh`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CO2 Evolution area chart */}
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
            Evolucao CO&#x2082; Evitado
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mb-4">
            Toneladas de CO&#x2082;e evitadas por mes
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={co2Data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
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
                  width={44}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--border)', strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="co2"
                  name="CO2 Evitado"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="rgba(5,150,105,0.12)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#059669' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production breakdown stacked bar */}
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
            Producao Mensal
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mb-4">
            Reparticao: composto, digestato e biogas (mil m&#x00B3;)
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
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
                  width={44}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="composto"
                  name="Composto (ton)"
                  stackId="prod"
                  fill="#059669"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="digestato"
                  name="Digestato (ton)"
                  stackId="prod"
                  fill="#3B82F6"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="biogas"
                  name="Biogas (mil m3)"
                  stackId="prod"
                  fill="#F59E0B"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
