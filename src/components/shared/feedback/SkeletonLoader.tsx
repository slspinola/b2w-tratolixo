interface SkeletonLoaderProps {
  type: 'card' | 'text' | 'chart' | 'kpi';
  count?: number;
}

function SkeletonPulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--b2s-radius-sm)] bg-[var(--bg-hover)] ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonKpi() {
  return (
    <div
      className="
        flex flex-col gap-3 p-5
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
      "
    >
      <SkeletonPulse className="h-4 w-24" />
      <SkeletonPulse className="h-8 w-20" />
      <SkeletonPulse className="h-3 w-16" />
      <SkeletonPulse className="h-12 w-full" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="
        flex flex-col gap-4 p-5
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
      "
    >
      <SkeletonPulse className="h-5 w-32" />
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-3/4" />
      <SkeletonPulse className="h-4 w-1/2" />
    </div>
  );
}

function SkeletonText() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-5/6" />
      <SkeletonPulse className="h-4 w-2/3" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div
      className="
        flex flex-col gap-4 p-5
        bg-[var(--bg-card)]
        border border-[var(--border)]
        rounded-[var(--b2s-radius-lg)]
      "
    >
      <SkeletonPulse className="h-5 w-40" />
      <SkeletonPulse className="h-[200px] w-full rounded-[var(--b2s-radius-md)]" />
    </div>
  );
}

const SKELETON_MAP = {
  kpi: SkeletonKpi,
  card: SkeletonCard,
  text: SkeletonText,
  chart: SkeletonChart,
} as const;

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const Component = SKELETON_MAP[type];
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div role="status" aria-label="A carregar...">
      <span className="sr-only">A carregar...</span>
      {items.map((i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
