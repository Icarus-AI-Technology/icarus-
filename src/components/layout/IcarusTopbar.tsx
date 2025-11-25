/**
 * ICARUS v5.0 - Topbar Component
 * Barra superior com busca global, ações rápidas e perfil do usuário
 * Design: Standard HeroUI / Cyberpunk
 */

import React from 'react';
import { Menu, Moon, Sun, Bell, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Avatar } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';

export interface IcarusTopbarProps {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  userName?: string;
  userRole?: string;
}

export const IcarusTopbar: React.FC<IcarusTopbarProps> = ({
  sidebarCollapsed,
  darkMode,
  onToggleSidebar,
  onToggleDarkMode,
  userName = 'Roberto Silva',
  userRole = 'Gerente Comercial',
}) => {
  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-40 flex items-center justify-between px-6 py-2 transition-all duration-300 ease-in-out top-4 h-20 mr-4',
        sidebarCollapsed ? 'ml-[88px]' : 'ml-[314px]'
      )}
    >
      {/* Container Principal com Efeito Glass */}
      <div className="w-full h-full rounded-2xl bg-[#0b0d16]/80 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-between px-6">
        {/* Esquerda: Menu + Busca */}
        <div className="flex items-center gap-6 flex-1">
          <Button
            isIconOnly
            variant="light"
            onPress={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </Button>

          <div className="flex-1 max-w-xl">
            <Input
              placeholder="Buscar médicos, cirurgias, produtos..."
              startContent={<Search size={18} className="text-slate-500" />}
              classNames={{
                inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary h-10",
                input: "text-white placeholder:text-slate-500",
              }}
              variant="bordered"
              radius="lg"
            />
          </div>
        </div>

        {/* Direita: Ações + Perfil */}
        <div className="flex items-center gap-4">
          {/* Ações Rápidas (Ícones) */}
          <div className="flex items-center gap-2 pr-4 border-r border-white/10">
            <div className="relative">
              <Button isIconOnly variant="light" radius="full" className="text-slate-400 hover:text-white">
                <Bell size={20} />
              </Button>
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] font-bold text-white bg-red-500/80 rounded-full w-5 h-5 shadow-[0_0_8px_rgba(243,18,96,0.5)]">
                3
              </span>
            </div>

            <Button isIconOnly variant="light" radius="full" className="text-slate-400 hover:text-white">
              <MessageSquare size={20} />
            </Button>

            <Button isIconOnly variant="light" radius="full" onPress={onToggleDarkMode} className="text-slate-400 hover:text-white">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>

          {/* Perfil do Usuário */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-white leading-tight">
                {userName}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {userRole}
              </div>
            </div>

            <Avatar
              src="https://i.pravatar.cc/150?u=admin"
              isBordered
              color="success"
              size="sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

IcarusTopbar.displayName = 'IcarusTopbar';

export default IcarusTopbar;
