import { Search, Bell, MessageSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/oraclusx-ds/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernTopbarProps {
  sidebarCollapsed: boolean;
}

export function ModernTopbar({ sidebarCollapsed }: ModernTopbarProps) {
  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-30 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? '4rem' : '16rem',
      }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar médicos, cirurgias, produtos..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Notificações"
            className="relative h-10 w-10 p-0 hover:bg-slate-100"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </Button>

          {/* Messages */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Mensagens"
            className="h-10 w-10 p-0 hover:bg-slate-100"
          >
            <MessageSquare className="w-5 h-5 text-slate-600" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://i.pravatar.cc/150?img=33" />
                  <AvatarFallback>RB</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-slate-900">Roberto Silva</div>
                  <div className="text-xs text-slate-500">Gerente</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600">Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
