import { Target } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface NationalTargetsProps {
  metrics: CouncillorMetrics;
}

interface TargetBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  description: string;
}

function TargetBar({ label, current, target, unit, description }: TargetBarProps) {
  const progressPct = Math.min((current / target) * 100, 100);
  const isAchieved = current >= target;

  const barColor = isAchieved
    ? 'var(--success-default)'
    : progressPct >= 75
      ? 'var(--warning-default)'
      : progressPct >= 50
        ? '#F97316'
        : 'var(--danger-default)';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </span>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-sm font-bold"
            style={{ color: barColor }}
          >
            {formatNumber(current, 1)}{unit}
          </span>
          <span
            className="text-xs ml-1"
            style={{ color: 'var(--text-muted)' }}
          >
            / {formatNumber(target, 0)}{unit}
          </span>
        </div>
      </div>

      <div className="relative">
        <div
          className="h-3 rounded-full w-full"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div
            className="h-3 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: barColor,
            }}
          />
        </div>

        {/* Target marker */}
        <div
          className="absolute top-0 h-3 w-0.5"
          style={{
            left: '100%',
            background: 'var(--text-muted)',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span style={{ color: 'var(--text-muted)' }}>
          {formatNumber(progressPct, 0)}% da meta
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Meta PERSU 2030+: {formatNumber(target, 0)}{unit}
        </span>
      </div>
    </div>
  );
}

export function NationalTargets({ metrics }: NationalTargetsProps) {
  // Calculate current values from metrics
  const totalBioTon = metrics.parishScores.reduce((s, p) => s + p.bioTon, 0);
  const totalPop = metrics.parishScores.reduce((s, p) => s + p.populacao, 0);
  const avgContam = metrics.parishScores.length > 0
    ? metrics.parishScores.reduce((s, p) => s + p.taxaContaminacao * p.bioTon, 0) / totalBioTon
    : 0;

  // PERSU 2030+ targets
  // 1. Separate collection rate target: 50% (kg/hab/year >= 50)
  const kgPerCapitaAno = totalPop > 0 ? (totalBioTon * 1000) / totalPop * (12 / Math.max(metrics.parishTrends[0]?.scores.length ?? 1, 1)) : 0;
  const recolhaSeletivaAtual = Math.min(kgPerCapitaAno / 80 * 50, 48);

  // 2. Contamination quality target: <15%
  const qualidadeAtual = 100 - avgContam;

  // 3. Bio-waste diversion from landfill: target 65%
  const desvioAtual = (1 - avgContam / 100) * 100 * 0.65;

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Target size={18} style={{ color: 'var(--primary-default)' }} />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Metas Nacionais (PERSU 2030+)
        </h3>
      </div>

      <div className="space-y-6">
        <TargetBar
          label="Recolha Seletiva de Biorresiduos"
          current={recolhaSeletivaAtual}
          target={50}
          unit="%"
          description="Meta de separacao na origem para recolha seletiva"
        />

        <TargetBar
          label="Qualidade do Material Recolhido"
          current={qualidadeAtual}
          target={85}
          unit="%"
          description="Pureza do biorresiduo recolhido (sem contaminantes)"
        />

        <TargetBar
          label="Desvio de Aterro"
          current={desvioAtual}
          target={65}
          unit="%"
          description="Biorresiduos desviados de aterro para valorizacao"
        />
      </div>

      <div
        className="mt-5 pt-4 text-[10px]"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        Metas alinhadas com o PERSU 2030+, Diretiva (UE) 2018/851 e Pacote de
        Economia Circular. Valores calculados com base nos dados do periodo
        selecionado.
      </div>
    </div>
  );
}
