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
import type { CeoMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

// ---- Types ----

type MunComparison = CeoMetrics['municipalityComparison'][number];

interface MunicipalityComparisonProps {
  data: MunComparison[];
}

// ---- Colours per category ----

const CATEGORY_COLORS: Record<string, string> = {
  bioTon: '#3B82F6',
  contaminacao: '#F59E0B',
  co2Evitado: '#22C55E',
  custoTotal: '#8B5CF6',
};

const CATEGORY_LABELS: Record<string, string> = {
  bioTon: 'Bio (ton)',
  contaminacao: 'Contaminacao (%)',
  co2Evitado: 'CO2 Evitado (tCO2e)',
  custoTotal: 'Custo Total (EUR)',
};

// ---- Custom tooltip ----

interface TooltipPayloadEntry {
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
      <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{CATEGORY_LABELS[entry.dataKey] ?? entry.dataKey}:</span>
          <span className="font-medium text-[var(--text-primary)] tabular-nums">
            {formatNumber(entry.value, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Component ----

export default function MunicipalityComparison({ data }: MunicipalityComparisonProps) {
  // Transform data for recharts: each municipality as a row with all categories
  const chartData = data.map((m) => ({
    nome: m.nome,
    bioTon: m.bioTon,
    contaminacao: m.contaminacao,
    co2Evitado: m.co2Evitado,
    custoTotal: Math.round(m.custoTotal / 1000), // show in thousands
  }));

  return (
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
        Comparacao por Municipio
      </h3>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Metricas agregadas por municipio no periodo selecionado
      </p>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
            barCategoryGap="20%"
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="nome"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => CATEGORY_LABELS[value] ?? value}
            />
            <Bar dataKey="bioTon" fill={CATEGORY_COLORS.bioTon} radius={[3, 3, 0, 0]} />
            <Bar dataKey="contaminacao" fill={CATEGORY_COLORS.contaminacao} radius={[3, 3, 0, 0]} />
            <Bar dataKey="co2Evitado" fill={CATEGORY_COLORS.co2Evitado} radius={[3, 3, 0, 0]} />
            <Bar dataKey="custoTotal" fill={CATEGORY_COLORS.custoTotal} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
