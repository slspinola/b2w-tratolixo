import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';

const dashboardTitles: Record<string, string> = {
  '/desempenho': 'Desempenho Global',
  '/operacional': 'Operacional',
  '/financeiro': 'Sustentabilidade Económica',
  '/territorial': 'Impacto Territorial',
  '/rastreabilidade': 'Rastreabilidade',
};

function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

export default function AppShell() {
  const { isMobile, isTablet } = useBreakpoint();
  const location = useLocation();

  // Sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine collapsed state: collapsed on tablet, hidden on mobile
  const sidebarCollapsed = isTablet;

  const handleMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  // Resolve page title
  const baseRoute = '/' + location.pathname.split('/').filter(Boolean)[0];
  const title = dashboardTitles[baseRoute] ?? 'Dashboard';

  // Sidebar width for content margin
  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 280;

  return (
    <div className="min-h-screen bg-[var(--bg-body)]">
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/50
            transition-opacity duration-200
          "
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        // Mobile: sidebar slides in/out
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-[280px]
            transform transition-transform duration-200 ease-[var(--b2s-easing-default)]
            ${mobileOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
          `}
        >
          <Sidebar collapsed={false} onToggle={handleMenuToggle} onNavigate={() => setMobileOpen(false)} />
        </div>
      ) : (
        // Tablet & Desktop: always visible
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleMenuToggle} />
      )}

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <Header
          title={title}
          onMenuToggle={handleMenuToggle}
          showMenuButton={isMobile}
        />

        {/* Page content — isolate stacking context so map z-indexes stay below the header */}
        <main className="flex-1 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
