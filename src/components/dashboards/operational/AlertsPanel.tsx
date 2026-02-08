import { useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import type { ActiveAlert } from '../../../mock-data/computed/operationalMetrics.js';

interface AlertsPanelProps {
  alerts: ActiveAlert[];
}

const severityConfig: Record<
  ActiveAlert['severidade'],
  { color: string; bg: string; borderColor: string; badgeBg: string; icon: typeof AlertTriangle; label: string }
> = {
  critica: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
    badgeBg: 'rgba(239, 68, 68, 0.1)',
    icon: AlertTriangle,
    label: 'Critica',
  },
  alta: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.12)',
    badgeBg: 'rgba(239, 68, 68, 0.1)',
    icon: AlertTriangle,
    label: 'Alta',
  },
  media: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.12)',
    badgeBg: 'rgba(245, 158, 11, 0.1)',
    icon: AlertCircle,
    label: 'Media',
  },
  baixa: {
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.06)',
    borderColor: 'rgba(59, 130, 246, 0.12)',
    badgeBg: 'rgba(59, 130, 246, 0.1)',
    icon: Info,
    label: 'Baixa',
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const unresolvedAlerts = useMemo(
    () => alerts.filter((a) => !a.resolvido),
    [alerts],
  );

  const totalUnresolved = unresolvedAlerts.length;

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5 h-full flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Alertas Ativos
        </h3>
        {totalUnresolved > 0 && (
          <span
            className="
              inline-flex items-center justify-center
              min-w-[22px] h-[22px] px-1.5
              text-[11px] font-bold text-white
              rounded-full
            "
            style={{ background: 'var(--danger-default)' }}
          >
            {totalUnresolved}
          </span>
        )}
      </div>

      {/* Alert list */}
      <div
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ maxHeight: '260px' }}
      >
        {unresolvedAlerts.length === 0 ? (
          <p
            className="text-xs text-center py-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sem alertas ativos
          </p>
        ) : (
          unresolvedAlerts.map((alert) => {
            const cfg = severityConfig[alert.severidade];
            const IconComponent = cfg.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-[var(--b2s-radius-sm)] transition-colors duration-150"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.borderColor}`,
                }}
              >
                <div className="mt-0.5 shrink-0">
                  <IconComponent
                    size={16}
                    style={{ color: cfg.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        color: cfg.color,
                        background: cfg.badgeBg,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {alert.sector}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {alert.mensagem}
                  </p>
                  <div
                    className="flex items-center gap-1 mt-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Clock size={10} aria-hidden="true" />
                    <span className="text-[10px]">{alert.hora}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
