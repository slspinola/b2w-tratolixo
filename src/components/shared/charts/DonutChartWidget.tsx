import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../../utils/formatters.ts';

interface DonutChartWidgetProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  title?: string;
  centerLabel?: string;
}

function PtTooltipFormatter(value: string | number) {
  return formatNumber(Number(value), 1);
}

export function DonutChartWidget({
  data,
  height = 300,
  title,
  centerLabel,
}: DonutChartWidgetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const innerRadius = Math.round(height * 0.22);
  const outerRadius = Math.round(height * 0.35);

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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>

          {/* Center label */}
          {centerLabel !== undefined && (
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fill: 'var(--text-primary)' }}
            >
              <tspan
                x="50%"
                dy="-8"
                fontSize="20"
                fontWeight="700"
              >
                {formatNumber(total)}
              </tspan>
              <tspan
                x="50%"
                dy="20"
                fontSize="11"
                fontWeight="500"
                style={{ fill: 'var(--text-secondary)' }}
              >
                {centerLabel}
              </tspan>
            </text>
          )}

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
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
