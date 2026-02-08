import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../../utils/formatters.ts';

interface AreaChartWidgetProps {
  data: Record<string, unknown>[];
  dataKey: string;
  series: { key: string; color: string; name: string }[];
  height?: number;
  title?: string;
}

function PtTooltipFormatter(value: string | number) {
  return formatNumber(Number(value), 1);
}

export function AreaChartWidget({
  data,
  dataKey,
  series,
  height = 300,
  title,
}: AreaChartWidgetProps) {
  const gradientIds = useMemo(
    () =>
      series.map((s) => `area-gradient-${s.key}-${Math.random().toString(36).slice(2, 9)}`),
    [series],
  );

  return (
    <div
      className="
        flex flex-col gap-3 p-5
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
        shadow-[var(--shadow-sm)]
      "
    >
      {title && (
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient
                key={s.key}
                id={gradientIds[i]}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey={dataKey}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            formatter={PtTooltipFormatter}
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--b2s-radius-sm)',
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          />
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${gradientIds[i]})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
