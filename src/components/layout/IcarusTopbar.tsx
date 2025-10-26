/**
 * ICARUS v5.0 - Topbar Component
 * Barra superior com busca global, ações rápidas e perfil do usuário
 * Design: Neuromórfico Premium 3D (OraclusX DS)
 */

import React from"react";
import { 
  Bell, 
  HelpCircle, 
  Menu, 
  Moon, 
  Sun,
  Settings,
  User
} from"lucide-react";
import { SearchContainer } from"../oraclusx-ds/SearchContainer";

export interface IcarusTopbarProps {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  unreadCount?: number;
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  userName?: string;
  userRole?: string;
}

export const IcarusTopbar: React.FC<IcarusTopbarProps> = ({
  sidebarCollapsed,
  darkMode,
  unreadCount: _unreadCount = 0,
  onToggleSidebar,
  onToggleDarkMode,
  onOpenNotifications,
  onOpenSettings,
  onOpenHelp,
  userName ="Roberto Silva",
  userRole ="Gerente Comercial"
}) => {
  return (
    <header 
      className="neumorphic-card fixed left-0 right-0 z-40 flex items-center justify-between px-6 py-2" 
      style={{ 
        top: '16px', 
        marginLeft: sidebarCollapsed ? '88px' : '314px', // Dinâmico: 64px (sidebar) + 24px (gap) = 88px
        marginRight: '16px',
        height: '64px',
        transition: 'margin-left 0.3s ease' // Transição suave
      }}
    >
      {/* Esquerda: Menu + Busca */}
      <div className="flex items-center gap-4 flex-1">
        {/* Botão Menu - SEM BORDA */}
        <button
          onClick={onToggleSidebar}
          className="neumorphic-button p-2.5 rounded-lg"
          aria-label="Abrir/Fechar Menu"
          title="Abrir/Fechar Menu"
          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', border: 'none', outline: 'none' }}
        >
          <Menu size={20} />
        </button>

        {/* Busca Global */}
        <div className="flex-1 max-w-md">
          <SearchContainer
            placeholder="Buscar médicos, cirurgias, produtos..."
            showFilters={false}
          />
        </div>
      </div>

      {/* Direita: Ações + Perfil */}
      <div className="flex items-center gap-3">
        {/* Botão Ajuda - SEM BORDA */}
        <button
          onClick={onOpenHelp}
          className="neumorphic-button p-2.5 rounded-full"
          aria-label="Central de Ajuda"
          title="Central de Ajuda"
          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', border: 'none', outline: 'none' }}
        >
          <HelpCircle size={20} />
        </button>

        {/* Botão Notificações com Badge - SEM BORDA */}
        <button
          onClick={onOpenNotifications}
          className="neumorphic-button p-2.5 rounded-full relative"
          aria-label="3 notificações não lidas"
          title="3 notificações não lidas"
          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', border: 'none', outline: 'none' }}
        >
          <Bell size={20} />
          <span 
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-white rounded-full" style={{ 
              background: 'var(--orx-error)',
              fontSize: '0.813rem',
              border: 'none', // SEM BORDA BRANCA
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
            , fontWeight: 700 }}
          >
            3
          </span>
        </button>

        {/* Botão Tema Claro/Escuro - SEM BORDA */}
        <button
          onClick={onToggleDarkMode}
          className="neumorphic-button p-2.5 rounded-full"
          aria-label={darkMode ?"Modo Claro" :"Modo Escuro"}
          title={darkMode ?"Modo Claro" :"Modo Escuro"}
          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', border: 'none', outline: 'none' }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Botão Configurações - SEM BORDA */}
        <button
          onClick={onOpenSettings}
          className="neumorphic-button p-2.5 rounded-full"
          aria-label="Configurações"
          title="Configurações"
          style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', border: 'none', outline: 'none' }}
        >
          <Settings size={20} />
        </button>

        {/* Separador Vertical */}
        <div 
          className="w-px h-8 mx-2"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
          }}
        />

        {/* Área do Usuário */}
        <div className="flex items-center gap-3">
          {/* Nome e Cargo */}
          <div className="text-right hidden md:block">
            <div style={{ 
              fontSize: '0.813rem',
              fontWeight: 600,
              lineHeight: '18px',
              color: 'var(--orx-text-primary)',
              fontFamily: 'var(--orx-font-family)'
            }}>
              {userName}
            </div>
            <div style={{ 
              fontSize: '0.813rem',
              fontWeight: 400,
              lineHeight: '16px',
              color: 'var(--orx-text-secondary)',
              fontFamily: 'var(--orx-font-family)'
            }}>
              {userRole}
            </div>
          </div>

          {/* Avatar */}
          <button
            onClick={onOpenSettings}
            className="rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              width: '36px',
              height: '36px',
              background: 'var(--orx-primary)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
            }}
            aria-label="Perfil do Usuário"
            title="Perfil do Usuário"
          >
            <User size={20} color="white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

IcarusTopbar.displayName ="IcarusTopbar";

export default IcarusTopbar;

