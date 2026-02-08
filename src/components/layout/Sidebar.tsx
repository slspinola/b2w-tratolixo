import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Gauge,
  MapPin,
  ScanLine,
  Recycle,
  Sun,
  Moon,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '../../theme/useTheme';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/desempenho', label: 'Desempenho Global', icon: LayoutDashboard },
  { path: '/operacional', label: 'Operacional', icon: Activity },
  { path: '/financeiro', label: 'Sustentabilidade Económica', icon: Gauge },
  { path: '/territorial', label: 'Impacto Territorial', icon: MapPin },
  { path: '/rastreabilidade', label: 'Rastreabilidade', icon: ScanLine },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { colorScheme, toggleColorScheme, b2sOverride, toggleB2S } = useTheme();

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen
        flex flex-col
        bg-[var(--bg-sidebar)]
        border-r border-[var(--border)]
        transition-[width] duration-200 ease-[var(--b2s-easing-default)]
        ${collapsed ? 'w-16' : 'w-[280px]'}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div
        className={`
          flex items-center gap-3
          h-[70px] shrink-0
          border-b border-[var(--border)]
          ${collapsed ? 'justify-center px-2' : 'px-6'}
        `}
      >
        <div
          className="
            flex items-center justify-center
            w-11 h-11 shrink-0
            rounded-[var(--b2s-radius-md)]
            bg-[var(--primary-default)]
            text-white
          "
        >
          <Recycle size={24} strokeWidth={2} />
        </div>
        {!collapsed && (
          <span
            className="
              text-[18px] font-semibold leading-snug
              text-[var(--text-primary)]
              whitespace-nowrap
            "
          >
            Bee2Waste
          </span>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <p
            className="
              px-6 pb-2
              text-[10px] font-semibold
              text-[var(--text-muted)]
              tracking-widest uppercase
            "
          >
            Dashboards
          </p>
        )}
        <ul className="flex flex-col gap-1 px-3" role="list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center gap-3
                  rounded-[var(--b2s-radius-sm)]
                  transition-colors duration-150
                  ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${
                    isActive
                      ? 'bg-[var(--primary-surface)] text-[var(--primary-hover)] border-l-[4px] border-[var(--primary-default)] font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border-l-[4px] border-transparent'
                  }
                `}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <item.icon
                  size={20}
                  strokeWidth={2}
                  className="shrink-0"
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="text-[14px] leading-normal">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div
        className={`
          shrink-0
          border-t border-[var(--border)]
          py-4
          ${collapsed ? 'px-2' : 'px-4'}
        `}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleColorScheme}
          className={`
            flex items-center gap-3
            w-full
            rounded-[var(--b2s-radius-sm)]
            py-2.5
            text-[var(--text-secondary)]
            hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
            transition-colors duration-150
            cursor-pointer
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={colorScheme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
          aria-label={colorScheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {colorScheme === 'light' ? (
            <Moon size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Sun size={20} strokeWidth={2} aria-hidden="true" />
          )}
          {!collapsed && (
            <span className="text-[13px]">
              {colorScheme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}
        </button>

        {/* B2S brand toggle */}
        <button
          onClick={toggleB2S}
          className={`
            flex items-center gap-3
            w-full
            rounded-[var(--b2s-radius-sm)]
            py-2.5
            transition-colors duration-150
            cursor-pointer
            ${collapsed ? 'justify-center px-2' : 'px-3'}
            ${b2sOverride
              ? 'bg-[var(--primary-surface)] text-[var(--primary-default)] font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }
          `}
          title={b2sOverride ? 'Desativar tema B2S' : 'Ativar tema B2S'}
          aria-label={b2sOverride ? 'Desativar tema B2S' : 'Ativar tema B2S'}
          aria-pressed={b2sOverride}
        >
          <Palette size={20} strokeWidth={2} aria-hidden="true" />
          {!collapsed && (
            <span className="text-[13px]">
              Tema B2S
            </span>
          )}
        </button>

        {/* Version */}
        {!collapsed && (
          <p
            className="
              mt-2 px-3
              text-[11px] font-medium
              text-[var(--text-muted)]
              tracking-wide uppercase
            "
          >
            Version 1.0
          </p>
        )}
      </div>
    </aside>
  );
}
