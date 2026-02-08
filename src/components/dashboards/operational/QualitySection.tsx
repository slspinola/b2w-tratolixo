import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert } from 'lucide-react';
import type { OperationalMetrics } from '../../../mock-data/store.js';
import type { ActiveAlert } from '../../../mock-data/computed/operationalMetrics.js';
import { AlertsPanel } from './AlertsPanel.tsx';

interface QualitySectionProps {
  metrics: OperationalMetrics;
  alerts: ActiveAlert[];
}

// ---- Inline Gauge Chart ----

function GaugeChart({
  value,
  max,
  label,
  unit,
  thresholds,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  thresholds: { good: number; warn: number };
}) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value <= thresholds.good
      ? 'var(--success-default)'
      : value <= thresholds.warn
        ? 'var(--warning-default)'
        : 'var(--danger-default)';

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-4 flex flex-col items-center justify-center flex-1"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-[11px] font-semibold uppercase tracking-wider mb-3 self-start"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </h3>
      <svg width="100%" height="140" viewBox="0 0 240 140" aria-label={`${label}: ${value}${unit}`}>
        {/* Background arc */}
        <path
          d={describeArc(120, 115, 95, 0, Math.PI)}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={describeArc(120, 115, 95, Math.PI - (Math.PI) * (pct / 100), Math.PI)}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Value text */}
        <text
          x={120}
          y={105}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="34"
          fontWeight="700"
          fontFamily="inherit"
        >
          {value.toFixed(1)}
        </text>
        <text
          x={120}
          y={128}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize="13"
          fontFamily="inherit"
        >
          {unit}
        </text>
      </svg>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}

// ---- Inline Donut Chart ----

const CONTAMINATION_COLORS = [
  '#EF4444', '#10B981', '#3B82F6', '#F59E0B',
  '#8B5CF6', '#06B6D4', '#94A3B8',
];

const CONTAMINATION_LABELS = [
  'Plastico', 'Vidro', 'Papel/Cartao', 'Metal',
  'Textil', 'Organico N/B', 'Outros',
];

function ContaminationDonut({ bags }: { bags: OperationalMetrics['lastInspectedBags'] }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bag of bags) {
      if (bag.contaminado && bag.tipo_contaminacao) {
        counts.set(
          bag.tipo_contaminacao,
          (counts.get(bag.tipo_contaminacao) ?? 0) + 1,
        );
      }
    }
    // Generate synthetic data if too few contaminants
    if (counts.size < 3) {
      return CONTAMINATION_LABELS.map((nome, i) => ({
        name: nome,
        value: [28, 22, 18, 12, 8, 7, 5][i],
        color: CONTAMINATION_COLORS[i],
      }));
    }
    return Array.from(counts.entries()).map(([tipo, count]) => {
      const idx = ['CT-PLA', 'CT-VID', 'CT-PAP', 'CT-MET', 'CT-TEX', 'CT-ORG', 'CT-OUT'].indexOf(tipo);
      return {
        name: idx >= 0 ? CONTAMINATION_LABELS[idx] : tipo,
        value: count,
        color: idx >= 0 ? CONTAMINATION_COLORS[idx] : '#94A3B8',
      };
    });
  }, [bags]);

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-4 flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert
          size={16}
          style={{ color: 'var(--warning-default)' }}
          aria-hidden="true"
        />
        <h3
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tipos de Contaminacao
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--b2s-radius-sm)',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span
                className="text-[11px] flex-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.name}
              </span>
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Main Section ----

export function QualitySection({ metrics, alerts }: QualitySectionProps) {
  // Calculate contamination rate from inspected bags
  const contamBags = metrics.lastInspectedBags.filter((b) => b.contaminado).length;
  const totalBags = metrics.lastInspectedBags.length;
  const contamRate = totalBags > 0 ? (contamBags / totalBags) * 100 : 0;

  return (
    <div className="space-y-4">
      <h2
        className="text-base font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Controlo de Qualidade
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GaugeChart
          value={contamRate}
          max={30}
          label="Taxa de Contaminacao"
          unit="% contaminados"
          thresholds={{ good: 8, warn: 15 }}
        />
        <ContaminationDonut bags={metrics.lastInspectedBags} />
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
}
