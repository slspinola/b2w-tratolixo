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
import { formatNumber } from '../../../utils/formatters.ts';

interface BarChartWidgetProps {
  data: Record<string, unknown>[];
  dataKey: string;
  categories: { key: string; color: string; name: string }[];
  height?: number;
  title?: string;
}

function PtTooltipFormatter(value: string | number) {
  return formatNumber(Number(value), 1);
}

export function BarChartWidget({
  data,
  dataKey,
  categories,
  height = 300,
  title,
}: BarChartWidgetProps) {
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
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
        >
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
          {categories.map((cat) => (
            <Bar
              key={cat.key}
              dataKey={cat.key}
              name={cat.name}
              fill={cat.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
