import { Download } from 'lucide-react';
import { useFilterContext, type FilterState } from '../../hooks/useFilterContext.tsx';

interface FilterBarProps {
  showMunicipality?: boolean;
  showPeriod?: boolean;
  showShift?: boolean;
  showRoute?: boolean;
  showDate?: boolean;
  showExport?: boolean;
}

const municipalities = [
  { value: '', label: 'Todos os Municipios' },
  { value: 'cascais', label: 'Cascais' },
  { value: 'sintra', label: 'Sintra' },
  { value: 'oeiras', label: 'Oeiras' },
  { value: 'mafra', label: 'Mafra' },
];

const periods: { value: FilterState['periodo']; label: string }[] = [
  { value: 'mes', label: 'Mes Corrente' },
  { value: 'ytd', label: 'Acumulado (YTD)' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'ano', label: 'Ano' },
];

const shifts: { value: FilterState['turno']; label: string }[] = [
  { value: 'manha', label: 'Manha' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];

export function FilterBar({
  showMunicipality = true,
  showPeriod = true,
  showShift = false,
  showRoute: _showRoute = false,
  showDate: _showDate = false,
  showExport = true,
}: FilterBarProps) {
  const { filters, setMunicipio, setPeriodo, setTurno } = useFilterContext();

  return (
    <div
      className="
        flex flex-wrap items-end gap-3
        px-8 py-3
        bg-[var(--bg-card)]
        border-b border-[var(--border)]
      "
      role="toolbar"
      aria-label="Dashboard filters"
    >
      {/* Municipality select */}
      {showMunicipality && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-municipio"
            className="
              text-[11px] font-semibold uppercase tracking-wide
              text-[var(--text-secondary)]
            "
          >
            Municipio
          </label>
          <select
            id="filter-municipio"
            value={filters.municipio ?? ''}
            onChange={(e) => setMunicipio(e.target.value || null)}
            className="
              h-9 px-3
              text-[13px]
              bg-[var(--bg-secondary)]
              text-[var(--text-primary)]
              border border-[var(--border)]
              rounded-[var(--b2s-radius-sm)]
              outline-none
              focus:ring-2 focus:ring-[var(--primary-default)] focus:ring-offset-0
              transition-colors duration-150
              cursor-pointer
              appearance-none
            "
          >
            {municipalities.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Period select */}
      {showPeriod && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-periodo"
            className="
              text-[11px] font-semibold uppercase tracking-wide
              text-[var(--text-secondary)]
            "
          >
            Periodo
          </label>
          <select
            id="filter-periodo"
            value={filters.periodo}
            onChange={(e) => setPeriodo(e.target.value as FilterState['periodo'])}
            className="
              h-9 px-3
              text-[13px]
              bg-[var(--bg-secondary)]
              text-[var(--text-primary)]
              border border-[var(--border)]
              rounded-[var(--b2s-radius-sm)]
              outline-none
              focus:ring-2 focus:ring-[var(--primary-default)] focus:ring-offset-0
              transition-colors duration-150
              cursor-pointer
              appearance-none
            "
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Shift pill buttons */}
      {showShift && (
        <div className="flex flex-col gap-1">
          <span
            className="
              text-[11px] font-semibold uppercase tracking-wide
              text-[var(--text-secondary)]
            "
          >
            Turno
          </span>
          <div className="flex gap-0.5 rounded-[var(--b2s-radius-full)] bg-[var(--bg-secondary)] p-0.5" role="radiogroup" aria-label="Shift selection">
            {shifts.map((s) => (
              <button
                key={s.value}
                onClick={() => setTurno(filters.turno === s.value ? null : s.value)}
                role="radio"
                aria-checked={filters.turno === s.value}
                className={`
                  px-3 py-1.5
                  text-[12px] font-medium
                  rounded-[var(--b2s-radius-full)]
                  transition-colors duration-150
                  cursor-pointer
                  ${
                    filters.turno === s.value
                      ? 'bg-[var(--primary-default)] text-white shadow-[var(--shadow-sm)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export button */}
      {showExport && (
        <button
          className="
            flex items-center gap-2
            h-9 px-4
            text-[13px] font-medium
            text-[var(--text-secondary)]
            bg-[var(--bg-secondary)]
            border border-[var(--border)]
            rounded-[var(--b2s-radius-sm)]
            hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
            transition-colors duration-150
            cursor-pointer
          "
          aria-label="Export data"
        >
          <Download size={16} strokeWidth={2} aria-hidden="true" />
          Exportar
        </button>
      )}
    </div>
  );
}
