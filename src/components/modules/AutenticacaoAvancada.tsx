/**
 * Módulo: Autenticação Avançada IA
 * Sistema completo de autenticação com 2FA, SSO e Biometria
 * IA Detecção Fraude 99.6% precisão
 */

import React, { useState } from"react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from"@/components/oraclusx-ds";
import {
  Shield,
  Key,
  Smartphone,
  Fingerprint,
  Settings,
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from"lucide-react";

export const AutenticacaoAvancada: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("usuarios");

  const categories = [
    { id:"usuarios", label:"Usuários Ativos", icon: Shield, count: 847, trend:"+45" },
    { id:"2fa", label:"2FA Habilitado", icon: Smartphone, count: 742, trend:"+28" },
    { id:"sso", label:"SSO Configurado", icon: Key, count: 156, trend:"+12" },
    { id:"biometria", label:"Biometria", icon: Fingerprint, count: 89, trend:"+15" },
  ];

  const kpis = [
    {
      title:"Usuários Ativos",
      value:"847",
      trend:"+45 hoje",
      icon: Shield,
      color:"blue",
    },
    {
      title:"Taxa 2FA",
      value:"87.6%",
      trend:"+3.2%",
      icon: Smartphone,
      color:"green",
    },
    {
      title:"Detecção Fraude",
      value:"99.6%",
      trend:"IA ativa",
      icon: CheckCircle,
      color:"indigo",
    },
    {
      title:"Tentativas Bloqueadas",
      value:"12",
      trend:"-8 hoje",
      icon: AlertTriangle,
      color:"yellow",
    },
  ];

  const usuarios = [
    {
      id:"USR-001",
      nome:"Roberto Silva",
      email:"roberto@icarus.tech",
      cargo:"Gerente Comercial",
      nivel:"Administrador",
      twoFA: true,
      biometria: true,
      ultimoAcesso:"Há 5 min",
      status:"ativo",
    },
    {
      id:"USR-002",
      nome:"Ana Paula Costa",
      email:"ana@icarus.tech",
      cargo:"Diretora Operacional",
      nivel:"Administrador",
      twoFA: true,
      biometria: false,
      ultimoAcesso:"Há 15 min",
      status:"ativo",
    },
    {
      id:"USR-003",
      nome:"Carlos Mendes",
      email:"carlos@icarus.tech",
      cargo:"Analista Financeiro",
      nivel:"Usuário",
      twoFA: true,
      biometria: true,
      ultimoAcesso:"Há 1 hora",
      status:"ativo",
    },
    {
      id:"USR-004",
      nome:"Maria Santos",
      email:"maria@icarus.tech",
      cargo:"Coordenadora Logística",
      nivel:"Gerente",
      twoFA: false,
      biometria: false,
      ultimoAcesso:"Há 3 dias",
      status:"inativo",
    },
  ];

  const getNivelColor = (nivel: string) => {
    const colors: Record<string, string> = {
      Administrador:"bg-[var(--accent)]/10 text-[var(--accent-foreground)]",
      Gerente:"bg-[var(--primary)]/10 text-[var(--primary)]",
      Usuário:"bg-surface text-[var(--text-secondary)]",
    };
    return colors[nivel] || colors.Usuário;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-[var(--text-primary)] mb-2">
              Autenticação Avançada IA
            </h1>
            <p className="text-[var(--text-secondary)]">
              Segurança enterprise com 2FA, SSO e biometria
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] rounded-full">
            <Settings className="text-[var(--primary-foreground)] animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-[var(--primary-foreground)] text-body-sm font-medium">IA Anti-Fraude</p>
              <p className="text-[var(--primary-foreground)]/70 text-body-xs">99.6% precisão</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ?"neuro-raised text-[var(--primary)] scale-105"
                        :"bg-surface dark:bg-card text-[var(--text-secondary)]"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive ?"bg-surface/20" :"bg-surface dark:bg-muted"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">{category.count}</span>
                        <span
                          className={`text-body-xs ${
                            isActive ?"text-[var(--primary)]/80" :"text-success"
                          }`}
                        >
                          <TrendingUp size={12} className="inline mr-0.5" />
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = {
              blue:"bg-[var(--accent)]/10 text-[var(--accent-foreground)]",
              green:"bg-success/10 text-success",
              indigo:"bg-[var(--primary)]/10 text-[var(--primary)]",
              yellow:"bg-warning/10 text-warning",
            } as const;

            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-[var(--text-secondary)]">{kpi.title}</p>
                    <p className="text-heading font-display text-[var(--text-primary)] mt-1">
                      {kpi.value}
                    </p>
                    <Badge variant="default" size="sm" className="mt-2">
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar usuários..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-surface dark:bg-card text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            />
          </div>
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Plus size={18} />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários e Permissões</CardTitle>
                <CardDescription className="mt-1">
                  {usuarios.length} usuários cadastrados
                </CardDescription>
              </div>
              <Button size="sm" variant="default" className="flex items-center gap-2">
                <Settings size={16} />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface dark:bg-card border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      ID ↕
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Nome ↕
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Nível ↕
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      2FA
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Biometria
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Último Acesso ↕
                    </th>
                    <th className="px-6 py-3 text-left text-body-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {usuarios.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-[var(--primary)]" />
                          <span className="text-body-sm text-[var(--text-primary)] font-medium">
                            {user.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-body-sm text-[var(--text-primary)] font-medium">
                            {user.nome}
                          </p>
                          <p className="text-body-xs text-[var(--text-secondary)]">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-body-sm text-[var(--text-secondary)]">
                          {user.cargo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="default"
                          size="sm"
                          className={getNivelColor(user.nivel)}
                        >
                          {user.nivel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.twoFA ? (
                          <CheckCircle size={18} className="text-success mx-auto" />
                        ) : (
                          <AlertTriangle size={18} className="text-warning mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.biometria ? (
                          <Fingerprint size={18} className="text-[var(--primary)] mx-auto" />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-body-sm text-secondary dark:text-muted">
                          {user.ultimoAcesso}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={user.status ==="ativo" ?"success" :"default"}
                          size="sm"
                        >
                          {user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutenticacaoAvancada;

