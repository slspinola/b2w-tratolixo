const DEFAULT_OPTIONS = [
  { value: 'mes', label: 'Mes' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'ytd', label: 'YTD' },
  { value: 'ano', label: 'Ano' },
];

interface PeriodToggleProps {
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
}

export function PeriodToggle({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: PeriodToggleProps) {
  return (
    <div
      className="
        inline-flex items-center gap-0.5
        p-1
        bg-[var(--bg-secondary)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-full)]
      "
      role="radiogroup"
      aria-label="Selecionar periodo"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-1.5
              text-[12px] font-semibold
              rounded-[var(--b2s-radius-full)]
              border-none cursor-pointer
              transition-all duration-150
              ${
                isActive
                  ? 'bg-[var(--bg-card)] text-[var(--primary-default)] shadow-[var(--shadow-sm)]'
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            role="radio"
            aria-checked={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
