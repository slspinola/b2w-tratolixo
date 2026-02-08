import type { ReactNode } from 'react';
import { Package, Weight, Box, MapPin, Gauge, Droplets } from 'lucide-react';
import type { OperationalMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';
import { RoutesTable } from './RoutesTable.tsx';

interface OperationsSectionProps {
  metrics: OperationalMetrics;
  isMafra: boolean;
}

const MafraBadge = () => (
  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8B5CF6] text-white rounded-full">
    MAFRA
  </span>
);

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  iconBg: string;
}

function KpiCard({ label, value, subtitle, icon, iconBg }: KpiCardProps) {
  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-3 sm:p-4 lg:p-5 flex flex-col justify-between"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-[var(--b2s-radius-sm)] flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <div>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {subtitle && (
          <p
            className="text-[11px] mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function RouteComplianceBar({
  concluidas,
  total,
}: {
  concluidas: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const barColor =
    pct >= 80
      ? 'var(--success-default)'
      : pct >= 50
        ? 'var(--warning-default)'
        : 'var(--danger-default)';

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center mb-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cumprimento de Rotas
        </span>
        <MafraBadge />
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {pct}%
        </span>
        <span
          className="text-xs mb-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {concluidas}/{total} rotas
        </span>
      </div>
      {/* Progress bar */}
      <div
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}

function KmPerTonCard({ metrics }: { metrics: OperationalMetrics }) {
  // Estimate total km from routes
  const totalKm = metrics.routeStatuses.reduce(
    (sum, r) => sum + Math.round(r.sacos_recolhidos * 0.15),
    0,
  );
  const totalTon = metrics.pesoHojeKg / 1000;
  const kmPerTon = totalTon > 0 ? (totalKm / totalTon).toFixed(1) : '0.0';

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center mb-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Km / Tonelada
        </span>
        <MafraBadge />
      </div>
      <div className="flex items-center gap-3">
        <Gauge
          size={20}
          style={{ color: 'var(--primary-default)' }}
          aria-hidden="true"
        />
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {kmPerTon}
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          km/ton
        </span>
      </div>
    </div>
  );
}

export function OperationsSection({ metrics, isMafra }: OperationsSectionProps) {
  const pesoTon = (metrics.pesoHojeKg / 1000).toFixed(2);
  // Estimate volume from weight (bio-waste density ~0.6 ton/m3)
  const volumeM3 = (metrics.pesoHojeKg / 600).toFixed(1);
  const volumeMedioPorSacoL = metrics.sacosHoje > 0
    ? ((metrics.pesoHojeKg / 600) * 1000 / metrics.sacosHoje).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className={`grid gap-4 ${isMafra ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        <KpiCard
          label="Sacos Recolhidos"
          value={formatNumber(metrics.sacosHoje)}
          subtitle={`${metrics.rotasConcluidas}/${metrics.rotasTotal} rotas`}
          icon={<Package size={18} style={{ color: 'var(--primary-default)' }} aria-hidden="true" />}
          iconBg="rgba(59, 130, 246, 0.08)"
        />
        <KpiCard
          label="Peso Total"
          value={`${pesoTon} ton`}
          subtitle={`${formatNumber(metrics.pesoHojeKg)} kg`}
          icon={<Weight size={18} style={{ color: 'var(--success-default)' }} aria-hidden="true" />}
          iconBg="rgba(16, 185, 129, 0.08)"
        />
        <KpiCard
          label="Volume"
          value={`${volumeM3} m\u00B3`}
          subtitle="Estimativa (densidade 0.6)"
          icon={<Box size={18} style={{ color: 'var(--warning-default)' }} aria-hidden="true" />}
          iconBg="rgba(245, 158, 11, 0.08)"
        />
        <KpiCard
          label="Vol. Medio/Saco"
          value={`${volumeMedioPorSacoL} L`}
          subtitle="Volume medio estimado"
          icon={<Droplets size={18} style={{ color: '#8B5CF6' }} aria-hidden="true" />}
          iconBg="rgba(139, 92, 246, 0.08)"
        />

        {/* Mafra-only cards */}
        {isMafra && (
          <>
            <RouteComplianceBar
              concluidas={metrics.rotasConcluidas}
              total={metrics.rotasTotal}
            />
            <KmPerTonCard metrics={metrics} />
          </>
        )}
      </div>

      {/* Routes summary table (Mafra-only) */}
      {isMafra && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoutesTable routes={metrics.routeStatuses} />
          <BagsPerFreguesiaChart routes={metrics.routeStatuses} />
        </div>
      )}
    </div>
  );
}

// ---- Inline bar chart: Sacos por Freguesia ----

function BagsPerFreguesiaChart({ routes }: { routes: OperationalMetrics['routeStatuses'] }) {
  // Aggregate sacos by freguesia
  const aggregated = new Map<string, number>();
  for (const r of routes) {
    aggregated.set(r.freguesia, (aggregated.get(r.freguesia) ?? 0) + r.sacos_recolhidos);
  }
  const data = Array.from(aggregated.entries())
    .map(([freguesia, sacos]) => ({ freguesia, sacos }))
    .sort((a, b) => b.sacos - a.sacos)
    .slice(0, 8);

  const maxVal = Math.max(...data.map((d) => d.sacos), 1);

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5 h-full flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center mb-4">
        <MapPin
          size={16}
          style={{ color: 'var(--primary-default)' }}
          aria-hidden="true"
          className="mr-2"
        />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Sacos por Freguesia
        </h3>
      </div>

      <div className="flex-1 space-y-2.5">
        {data.map((item) => {
          const pct = (item.sacos / maxVal) * 100;
          return (
            <div key={item.freguesia} className="flex items-center gap-3">
              <span
                className="text-[11px] w-28 truncate text-right shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.freguesia}
              </span>
              <div className="flex-1 h-5 rounded-[var(--b2s-radius-sm)] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-[var(--b2s-radius-sm)] transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: 'var(--primary-default)',
                    opacity: 0.8,
                  }}
                />
              </div>
              <span
                className="text-[11px] font-semibold tabular-nums w-10 text-right shrink-0"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatNumber(item.sacos)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
