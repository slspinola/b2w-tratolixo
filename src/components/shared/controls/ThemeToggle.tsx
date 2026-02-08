import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../theme/useTheme.ts';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme, b2sOverride, toggleB2S } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <div className="flex items-center gap-4">
      {/* Light / Dark toggle */}
      <button
        onClick={toggleColorScheme}
        className="
          flex items-center justify-center
          w-9 h-9
          rounded-[var(--b2s-radius-sm)]
          bg-[var(--bg-secondary)]
          border border-[var(--border)]
          text-[var(--text-secondary)]
          hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
          transition-colors duration-150
          cursor-pointer
        "
        aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        title={isDark ? 'Tema claro' : 'Tema escuro'}
      >
        {isDark ? (
          <Sun size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Moon size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      {/* B2S brand override checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={b2sOverride}
          onChange={toggleB2S}
          className="
            w-4 h-4
            accent-[var(--primary-default)]
            cursor-pointer
          "
        />
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">
          B2S
        </span>
      </label>
    </div>
  );
}
