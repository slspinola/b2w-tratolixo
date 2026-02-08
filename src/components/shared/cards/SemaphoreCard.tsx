import { SparklineChart } from '../charts/SparklineChart.tsx';
import { formatNumber } from '../../../utils/formatters.ts';

const COR_MAP = {
  verde: '#10b981',
  amarelo: '#f59e0b',
  laranja: '#f97316',
  vermelho: '#ef4444',
} as const;

interface SemaphoreCardProps {
  titulo: string;
  score: number;
  cor: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
  descricao: string;
  sparkline: { mes: string; valor: number }[];
  onClick?: () => void;
}

export function SemaphoreCard({
  titulo,
  score,
  cor,
  descricao,
  sparkline,
  onClick,
}: SemaphoreCardProps) {
  const accentColor = COR_MAP[cor];

  return (
    <article
      className={`
        flex flex-col overflow-hidden
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
        shadow-[var(--shadow-sm)]
        transition-all duration-150
        hover:shadow-[var(--shadow-md)]
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${titulo}: ${formatNumber(score)} pontos - ${cor}`}
    >
      {/* Colored accent bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        {/* Title and score */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[14px] font-semibold leading-snug text-[var(--text-primary)]">
            {titulo}
          </h3>
          <span
            className="
              shrink-0 flex items-center justify-center
              min-w-[40px] h-7 px-2
              rounded-[var(--b2s-radius-full)]
              text-[13px] font-bold text-white
            "
            style={{ backgroundColor: accentColor }}
          >
            {formatNumber(score)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] m-0">
          {descricao}
        </p>

        {/* Sparkline */}
        {sparkline.length > 1 && (
          <div className="mt-1">
            <SparklineChart data={sparkline} color={accentColor} height={40} />
          </div>
        )}
      </div>
    </article>
  );
}
