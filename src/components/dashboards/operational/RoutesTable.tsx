import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import type { RouteStatus } from '../../../mock-data/computed/operationalMetrics.js';
import { formatNumber } from '../../../utils/formatters.js';

interface RoutesTableProps {
  routes: RouteStatus[];
}

const MafraBadge = () => (
  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8B5CF6] text-white rounded-full">
    MAFRA
  </span>
);

const estadoConfig: Record<
  RouteStatus['estado'],
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  concluida: {
    icon: CheckCircle2,
    color: 'var(--success-default)',
    label: 'Concluida',
  },
  em_curso: {
    icon: Loader2,
    color: 'var(--warning-default)',
    label: 'Em Curso',
  },
  pendente: {
    icon: Clock,
    color: 'var(--text-secondary)',
    label: 'Pendente',
  },
  atrasada: {
    icon: XCircle,
    color: 'var(--danger-default)',
    label: 'Atrasada',
  },
};

export function RoutesTable({ routes }: RoutesTableProps) {
  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-3 sm:p-4 lg:p-5 h-full flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex items-center mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Plano de Recolha
        </h3>
        <MafraBadge />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[580px]" style={{ color: 'var(--text-primary)' }}>
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              {['Rota', 'Turno', 'Freguesia', 'Planeados', 'Recolhidos', 'Peso (kg)', 'Estado'].map(
                (header) => (
                  <th
                    key={header}
                    className="text-[10px] font-semibold uppercase tracking-wider text-left py-2.5 px-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => {
              const cfg = estadoConfig[route.estado];
              const StatusIcon = cfg.icon;
              const deviationPct =
                route.sacos_planeados > 0
                  ? ((route.sacos_recolhidos - route.sacos_planeados) /
                      route.sacos_planeados) *
                    100
                  : 0;
              const deviationColor =
                deviationPct >= -5
                  ? 'var(--success-default)'
                  : deviationPct >= -20
                    ? 'var(--warning-default)'
                    : 'var(--danger-default)';

              return (
                <tr
                  key={route.rota_id}
                  className="border-b transition-colors duration-100"
                  style={{
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="py-2.5 px-2 font-medium">{route.codigo}</td>
                  <td className="py-2.5 px-2 capitalize">{route.turno}</td>
                  <td className="py-2.5 px-2">{route.freguesia}</td>
                  <td className="py-2.5 px-2 tabular-nums">
                    {formatNumber(route.sacos_planeados)}
                  </td>
                  <td className="py-2.5 px-2 tabular-nums">
                    <span style={{ color: deviationColor }}>
                      {formatNumber(route.sacos_recolhidos)}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 tabular-nums">
                    {formatNumber(route.peso_kg)}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon
                        size={14}
                        style={{ color: cfg.color }}
                        aria-hidden="true"
                        className={route.estado === 'em_curso' ? 'animate-spin' : ''}
                      />
                      <span
                        className="text-[11px]"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
