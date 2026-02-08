import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface ContaminationByTypeProps {
  data: CouncillorMetrics['contaminacaoPorTipo'];
}

export function ContaminationByType({ data }: ContaminationByTypeProps) {
  const sorted = [...data].sort((a, b) => b.kg - a.kg).slice(0, 7);
  const maxKg = Math.max(...sorted.map((d) => d.kg), 1);

  return (
    <div className="rounded-[var(--b2s-radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
        Contaminacao por Tipo
      </h3>
      <p className="text-[11px] text-[var(--text-secondary)] mb-4">
        Principais contaminantes nos biorresiduos
      </p>
      <div className="space-y-2.5">
        {sorted.map((item) => {
          const pct = (item.kg / maxKg) * 100;
          return (
            <div key={item.tipo} className="flex items-center gap-3">
              <span
                className="text-[11px] w-24 truncate text-right shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.nome}
              </span>
              <div
                className="flex-1 h-5 rounded-[var(--b2s-radius-sm)] overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div
                  className="h-full rounded-[var(--b2s-radius-sm)] transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: item.cor,
                    opacity: 0.8,
                  }}
                />
              </div>
              <span
                className="text-[11px] font-semibold tabular-nums w-16 text-right shrink-0"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatNumber(item.pct, 1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
