import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Header({ title, onMenuToggle, showMenuButton = false }: HeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-30
        flex items-center justify-between
        h-14 sm:h-16 lg:h-[70px]
        px-4 sm:px-6 lg:px-8
        bg-[var(--bg-card)]
        border-b border-[var(--border)]
        shadow-[var(--shadow-sm)]
      "
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="
              flex items-center justify-center
              w-10 h-10
              rounded-[var(--b2s-radius-sm)]
              text-[var(--text-secondary)]
              hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
              transition-colors duration-150
              cursor-pointer
            "
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
        <h3
          className="
            text-base lg:text-lg font-semibold leading-snug
            text-[var(--text-primary)]
          "
        >
          {title}
        </h3>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* User avatar placeholder */}
        <div
          className="
            flex items-center justify-center
            w-9 h-9
            rounded-full
            bg-[var(--primary-subtle)]
            text-[var(--primary-default)]
            text-[12px] font-semibold
            select-none
          "
          title="Admin Tratolixo"
          aria-label="User: Admin Tratolixo"
        >
          AT
        </div>
      </div>
    </header>
  );
}
