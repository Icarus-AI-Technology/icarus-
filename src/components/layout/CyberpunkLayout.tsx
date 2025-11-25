import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { IcarusSidebar } from './IcarusSidebar';
import { IcarusTopbar } from './IcarusTopbar';
import { AIChatWidget } from '../AIChatWidget';

export const CyberpunkLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-[#0f111a] text-white overflow-hidden font-sans relative">
      {/* SIDEBAR INTEGRADA */}
      <IcarusSidebar 
        collapsed={sidebarCollapsed} 
      />

      {/* TOPBAR INTEGRADA */}
      <IcarusTopbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* MAIN CONTENT */}
      <main 
        className="flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? '88px' : '290px',
          marginTop: '96px', // Altura Topbar + margem
          paddingRight: '16px',
          paddingBottom: '16px',
        }}
      >
        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto rounded-[2rem] scrollbar-hide relative bg-[#11131f]/50 border border-white/5 shadow-lg backdrop-blur-xl">
          <div className="p-6">
            <Outlet />
          </div>
        </div>

        {/* CHAT WIDGET */}
        <AIChatWidget />
      </main>
    </div>
  );
};
