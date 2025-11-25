import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ModernSidebar } from './ModernSidebar';
import { ModernTopbar } from './ModernTopbar';
import '../../styles/modern-theme.css';

export function ModernLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ModernSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Topbar */}
      <ModernTopbar sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '4rem' : '16rem',
        }}
      >
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
