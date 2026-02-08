import { useMemo } from 'react';
import { formatNumber } from '../../../utils/formatters.ts';

interface GaugeChartProps {
  value: number;
  label: string;
  size?: number;
  thresholds?: { verde: number; amarelo: number; laranja: number };
}

const DEFAULT_THRESHOLDS = { verde: 80, amarelo: 60, laranja: 40 };

function getGaugeColor(
  value: number,
  thresholds: { verde: number; amarelo: number; laranja: number },
): string {
  if (value >= thresholds.verde) return '#10b981';
  if (value >= thresholds.amarelo) return '#f59e0b';
  if (value >= thresholds.laranja) return '#f97316';
  return '#ef4444';
}

export function GaugeChart({
  value,
  label,
  size = 140,
  thresholds = DEFAULT_THRESHOLDS,
}: GaugeChartProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const color = getGaugeColor(clampedValue, thresholds);

  const gauge = useMemo(() => {
    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.4;
    const strokeWidth = size * 0.09;
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalArc = Math.PI;
    const valueAngle = startAngle - (clampedValue / 100) * totalArc;

    // Background arc (full semicircle)
    const bgX1 = cx + radius * Math.cos(startAngle);
    const bgY1 = cy - radius * Math.sin(startAngle);
    const bgX2 = cx + radius * Math.cos(endAngle);
    const bgY2 = cy - radius * Math.sin(endAngle);
    const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 0 1 ${bgX2} ${bgY2}`;

    // Value arc
    const valX1 = cx + radius * Math.cos(startAngle);
    const valY1 = cy - radius * Math.sin(startAngle);
    const valX2 = cx + radius * Math.cos(valueAngle);
    const valY2 = cy - radius * Math.sin(valueAngle);
    const largeArc = clampedValue > 50 ? 1 : 0;
    const valuePath =
      clampedValue > 0
        ? `M ${valX1} ${valY1} A ${radius} ${radius} 0 ${largeArc} 1 ${valX2} ${valY2}`
        : '';

    return { cx, cy, strokeWidth, bgPath, valuePath };
  }, [size, clampedValue]);

  const viewBoxHeight = size * 0.7;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={viewBoxHeight}
        viewBox={`0 0 ${size} ${viewBoxHeight}`}
        aria-label={`${label}: ${formatNumber(clampedValue)}%`}
        role="img"
      >
        {/* Background track */}
        <path
          d={gauge.bgPath}
          fill="none"
          stroke="var(--border)"
          strokeWidth={gauge.strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {clampedValue > 0 && (
          <path
            d={gauge.valuePath}
            fill="none"
            stroke={color}
            strokeWidth={gauge.strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 600ms ease, stroke 300ms ease',
            }}
          />
        )}

        {/* Center value */}
        <text
          x={gauge.cx}
          y={gauge.cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.18}
          fontWeight="700"
          fill="var(--text-primary)"
        >
          {formatNumber(clampedValue)}
        </text>
      </svg>

      {/* Label */}
      <span className="text-[12px] font-medium text-[var(--text-secondary)] text-center leading-snug">
        {label}
      </span>
    </div>
  );
}
