import { useState } from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}

const ALERT_CONFIG = {
  info: {
    bg: 'var(--primary-surface)',
    border: 'var(--primary-subtle)',
    text: 'var(--primary-default)',
    Icon: Info,
  },
  success: {
    bg: 'var(--success-surface)',
    border: 'var(--success-subtle)',
    text: 'var(--success-default)',
    Icon: CheckCircle2,
  },
  warning: {
    bg: 'var(--warning-surface)',
    border: 'var(--warning-subtle)',
    text: 'var(--warning-default)',
    Icon: AlertTriangle,
  },
  danger: {
    bg: 'var(--danger-surface)',
    border: 'var(--danger-subtle)',
    text: 'var(--danger-default)',
    Icon: XCircle,
  },
} as const;

export function AlertBanner({
  type,
  message,
  onDismiss,
  action,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const config = ALERT_CONFIG[type];
  const { Icon } = config;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div
      className="
        flex items-center gap-3 px-4 py-3
        rounded-[var(--b2s-radius-md)]
        border
      "
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
      role="alert"
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" aria-hidden="true" />

      <p className="flex-1 text-[13px] font-medium leading-snug m-0">
        {message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="
            shrink-0 text-[12px] font-semibold
            underline underline-offset-2
            hover:no-underline
            cursor-pointer
            bg-transparent border-none p-0
          "
          style={{ color: config.text }}
        >
          {action.label}
        </button>
      )}

      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="
            shrink-0 flex items-center justify-center
            w-6 h-6
            rounded-[var(--b2s-radius-sm)]
            hover:bg-black/5
            transition-colors duration-150
            cursor-pointer
            bg-transparent border-none p-0
          "
          style={{ color: config.text }}
          aria-label="Fechar alerta"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
