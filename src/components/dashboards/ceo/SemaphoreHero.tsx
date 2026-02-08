import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import type { SemaphoreData } from '../../../mock-data/store.js';

// ---- Colour mapping ----

const SEMAPHORE_STYLES: Record<
  SemaphoreData['cor'],
  { bg: string; border: string; text: string; fill: string; bar: string }
> = {
  verde: {
    bg: '#ecfdf5',
    border: '#059669',
    text: '#059669',
    fill: 'rgba(5,150,105,0.15)',
    bar: '#059669',
  },
  amarelo: {
    bg: '#fffbeb',
    border: '#d97706',
    text: '#d97706',
    fill: 'rgba(217,119,6,0.15)',
    bar: '#d97706',
  },
  laranja: {
    bg: '#fff7ed',
    border: '#ea580c',
    text: '#ea580c',
    fill: 'rgba(234,88,12,0.15)',
    bar: '#ea580c',
  },
  vermelho: {
    bg: '#fef2f2',
    border: '#dc2626',
    text: '#dc2626',
    fill: 'rgba(220,38,38,0.15)',
    bar: '#dc2626',
  },
};

const SEMAPHORE_LABELS: Record<SemaphoreData['cor'], string> = {
  verde: 'Verde',
  amarelo: 'Amarelo',
  laranja: 'Laranja',
  vermelho: 'Vermelho',
};

// ---- Trend icon ----

function TrendIcon({ tendencia }: { tendencia: 'positiva' | 'neutra' | 'negativa' }) {
  const size = 14;
  switch (tendencia) {
    case 'positiva':
      return <TrendingUp size={size} className="text-[var(--success-default)]" aria-hidden="true" />;
    case 'negativa':
      return <TrendingDown size={size} className="text-[var(--danger-default)]" aria-hidden="true" />;
    default:
      return <Minus size={size} className="text-[var(--text-secondary)]" aria-hidden="true" />;
  }
}

// ---- Component ----

interface SemaphoreHeroProps {
  semaforos: SemaphoreData[];
}

export default function SemaphoreHero({ semaforos }: SemaphoreHeroProps) {
  return (
    <section aria-label="Semaforos estrategicos" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {semaforos.map((sem) => (
        <SemaphoreCard key={sem.id} semaforo={sem} title={sem.pergunta} />
      ))}
    </section>
  );
}

// ---- Card ----

function SemaphoreCard({ semaforo, title }: { semaforo: SemaphoreData; title: string }) {
  const style = SEMAPHORE_STYLES[semaforo.cor];

  // Build mini sparkline data from detalhes first value trend
  const sparkData = useMemo(() => {
    // Generate a simple 6-point sparkline from the detalhes values
    const base = semaforo.detalhes[0]?.valor ?? 50;
    return Array.from({ length: 6 }, (_, i) => ({
      idx: i,
      val: base + (Math.random() - 0.5) * base * 0.1 * (i + 1),
    }));
  }, [semaforo]);

  const handleClick = () => {
    console.log('Semaphore detail clicked:', semaforo.id, semaforo);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        relative w-full text-left
        rounded-[var(--b2s-radius-md)]
        border border-[var(--border)]
        bg-[var(--bg-card)]
        shadow-[var(--shadow-sm)]
        overflow-hidden
        transition-shadow duration-200
        hover:shadow-[var(--shadow-md)]
        focus-visible:outline-2 focus-visible:outline-[var(--primary-default)]
        cursor-pointer
      "
      aria-label={`${title}: ${SEMAPHORE_LABELS[semaforo.cor]}`}
    >
      {/* Colored top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: style.bar }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
              {title}
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
              {semaforo.pergunta}
            </p>
          </div>

          {/* Status badge */}
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
          >
            {SEMAPHORE_LABELS[semaforo.cor]}
          </span>
        </div>

        {/* Sparkline */}
        <div className="h-10 w-full mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Area
                type="monotone"
                dataKey="val"
                stroke={style.bar}
                strokeWidth={1.5}
                fill={style.fill}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
          {semaforo.descricao}
        </p>

        {/* Detail indicators */}
        <div className="space-y-1.5">
          {semaforo.detalhes.map((det) => (
            <div key={det.indicador} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[var(--text-secondary)] truncate flex-1">{det.indicador}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[var(--text-primary)] tabular-nums">
                  {det.valor.toLocaleString('pt-PT')}
                </span>
                <TrendIcon tendencia={det.tendencia} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
