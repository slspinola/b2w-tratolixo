import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, TrendingUp, Clock } from 'lucide-react';
import type { OperationalMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface EfficiencySectionProps {
  metrics: OperationalMetrics;
}

// ---- Team Productivity Cards ----

function TeamProductivityCards({ teams }: { teams: OperationalMetrics['teamProductivity'] }) {
  // Aggregate metrics
  const totalSacos = teams.reduce((s, t) => s + t.sacos_dia, 0);
  const totalPesoKg = teams.reduce((s, t) => s + t.peso_dia_kg, 0);
  const avgEficiencia =
    teams.length > 0
      ? Math.round(teams.reduce((s, t) => s + t.eficiencia_pct, 0) / teams.length)
      : 0;

  // Estimate work hours (8h shift)
  const sacosPerHora = teams.length > 0 ? Math.round(totalSacos / (teams.length * 8)) : 0;
  const tonPerEquipa =
    teams.length > 0 ? ((totalPesoKg / 1000) / teams.length).toFixed(2) : '0.00';

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Users
          size={16}
          style={{ color: 'var(--primary-default)' }}
          aria-hidden="true"
        />
        <h3
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Produtividade das Equipas
        </h3>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <span
            className="text-[10px] font-medium uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sacos/Hora
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp size={14} style={{ color: 'var(--success-default)' }} aria-hidden="true" />
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {sacosPerHora}
            </span>
          </div>
        </div>
        <div>
          <span
            className="text-[10px] font-medium uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ton/Equipa
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {tonPerEquipa}
            </span>
          </div>
        </div>
        <div>
          <span
            className="text-[10px] font-medium uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Eficiencia Media
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="text-lg font-bold tabular-nums"
              style={{
                color:
                  avgEficiencia >= 80
                    ? 'var(--success-default)'
                    : avgEficiencia >= 50
                      ? 'var(--warning-default)'
                      : 'var(--danger-default)',
              }}
            >
              {avgEficiencia}%
            </span>
          </div>
        </div>
      </div>

      {/* Per-team rows */}
      <div className="space-y-2">
        {teams.slice(0, 5).map((team) => (
          <div
            key={team.equipa_id}
            className="flex items-center gap-3 py-2 px-3 rounded-[var(--b2s-radius-sm)]"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <span
              className="text-xs font-medium flex-1 truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {team.nome}
            </span>
            <span
              className="text-[11px] tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatNumber(team.sacos_dia)} sacos
            </span>
            <span
              className="text-[11px] tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {(team.peso_dia_kg / 1000).toFixed(1)} ton
            </span>
            {/* Efficiency bar */}
            <div className="w-16 flex items-center gap-1.5">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--border)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${team.eficiencia_pct}%`,
                    background:
                      team.eficiencia_pct >= 80
                        ? 'var(--success-default)'
                        : team.eficiencia_pct >= 50
                          ? 'var(--warning-default)'
                          : 'var(--danger-default)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-semibold tabular-nums w-7 text-right"
                style={{ color: 'var(--text-primary)' }}
              >
                {team.eficiencia_pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Incidents Bar Chart ----

const SECTOR_COLORS: Record<string, string> = {
  triagem: '#8B5CF6',
  recepcao: '#3B82F6',
  pesagem: '#F59E0B',
  compactacao: '#10B981',
  descarga: '#EF4444',
};

function IncidentsChart({
  incidents,
}: {
  incidents: OperationalMetrics['incidentsBySector'];
}) {
  const data = useMemo(
    () =>
      incidents.map((i) => ({
        ...i,
        sector: i.sector.charAt(0).toUpperCase() + i.sector.slice(1),
        fill: SECTOR_COLORS[i.sector] ?? '#94A3B8',
      })),
    [incidents],
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
        className="text-[11px] font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        Incidentes por Sector
      </h3>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="sector"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--b2s-radius-sm)',
                fontSize: '11px',
              }}
              formatter={(val: string | number) => [val, 'Incidentes']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- MTTR Gauge ----

function MttrGauge({ minutes }: { minutes: number }) {
  const max = 60;
  const pct = Math.min((minutes / max) * 100, 100);
  const color =
    minutes <= 15
      ? 'var(--success-default)'
      : minutes <= 30
        ? 'var(--warning-default)'
        : 'var(--danger-default)';

  // SVG arc gauge
  const radius = 75;
  const cx = 100;
  const cy = 85;
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - (startAngle - endAngle) * (pct / 100);

  const bgPath = describeArc(cx, cy, radius, endAngle, startAngle);
  const valPath = describeArc(cx, cy, radius, sweepAngle, startAngle);

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-4 flex flex-col items-center justify-center"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-2 mb-3 self-start">
        <Clock
          size={14}
          style={{ color: 'var(--text-secondary)' }}
          aria-hidden="true"
        />
        <h3
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          MTTR
        </h3>
      </div>

      <svg width="100%" height="120" viewBox="0 0 200 120" aria-label={`MTTR: ${minutes} minutos`}>
        <path
          d={bgPath}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={valPath}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <text
          x={100}
          y={90}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="30"
          fontWeight="700"
          fontFamily="inherit"
        >
          {minutes}
        </text>
        <text
          x={100}
          y={112}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize="12"
          fontFamily="inherit"
        >
          minutos
        </text>
      </svg>
      <p
        className="text-[10px] text-center mt-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        Tempo medio de resolucao
      </p>
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

// ---- Main Section ----

export function EfficiencySection({ metrics }: EfficiencySectionProps) {
  return (
    <div className="space-y-4">
      <h2
        className="text-base font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Eficiencia Operacional
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TeamProductivityCards teams={metrics.teamProductivity} />
        <IncidentsChart incidents={metrics.incidentsBySector} />
        <MttrGauge minutes={metrics.mttrMinutes} />
      </div>
    </div>
  );
}
