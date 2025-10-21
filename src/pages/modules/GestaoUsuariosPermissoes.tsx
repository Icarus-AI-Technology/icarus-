/**
 * GESTÃO DE USUÁRIOS E PERMISSÕES (RBAC) - ICARUS v5.0
 * Controle de acesso baseado em papéis (Role-Based Access Control)
 */

import { useState } from"react";
import {
  Users,
  Shield,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  UserPlus,
  Activity,
} from"lucide-react";

interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  role: string;
  status:"ativo" |"inativo" |"bloqueado";
  ultimoAcesso: string;
  criadoEm: string;
}

interface Role {
  id: string;
  nome: string;
  descricao: string;
  usuarios: number;
  permissoes: number;
  cor: string;
}

export default function GestaoUsuariosPermissoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"usuarios" |"roles">("usuarios");

  // Mock data - Usuários
  const usuarios: User[] = [
    {
      id:"1",
      nome:"Ana Paula Silva",
      email:"ana.silva@icarus.com",
      cargo:"Gerente Comercial",
      role:"Gerente",
      status:"ativo",
      ultimoAcesso:"2025-10-20T15:30:00",
      criadoEm:"2024-01-15",
    },
    {
      id:"2",
      nome:"Carlos Eduardo Santos",
      email:"carlos.santos@icarus.com",
      cargo:"Analista de Faturamento",
      role:"Analista",
      status:"ativo",
      ultimoAcesso:"2025-10-20T14:20:00",
      criadoEm:"2024-03-22",
    },
    {
      id:"3",
      nome:"Maria Fernanda Costa",
      email:"maria.costa@icarus.com",
      cargo:"Assistente Administrativo",
      role:"Operador",
      status:"ativo",
      ultimoAcesso:"2025-10-20T10:15:00",
      criadoEm:"2024-06-10",
    },
    {
      id:"4",
      nome:"João Pedro Oliveira",
      email:"joao.oliveira@icarus.com",
      cargo:"Coordenador de Logística",
      role:"Coordenador",
      status:"inativo",
      ultimoAcesso:"2025-10-18T16:45:00",
      criadoEm:"2024-02-05",
    },
  ];

  // Mock data - Roles
  const roles: Role[] = [
    {
      id:"1",
      nome:"Administrador",
      descricao:"Acesso total ao sistema",
      usuarios: 2,
      permissoes: 127,
      cor:"var(--orx-error-dark)",
    },
    {
      id:"2",
      nome:"Gerente",
      descricao:"Gestão de módulos e equipes",
      usuarios: 5,
      permissoes: 89,
      cor:"var(--orx-primary)",
    },
    {
      id:"3",
      nome:"Analista",
      descricao:"Operações e análises",
      usuarios: 12,
      permissoes: 45,
      cor:"var(--orx-success)",
    },
    {
      id:"4",
      nome:"Operador",
      descricao:"Operações básicas",
      usuarios: 28,
      permissoes: 18,
      cor:"var(--orx-warning)",
    },
    {
      id:"5",
      nome:"Visualizador",
      descricao:"Apenas leitura",
      usuarios: 8,
      permissoes: 5,
      cor:"var(--orx-gray-500)",
    },
  ];

  const kpis = [
    {
      title:"Usuários Ativos",
      value:"47",
      trend:"+5",
      icon: Users,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
    },
    {
      title:"Roles Configurados",
      value:"5",
      trend:"100%",
      icon: Shield,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
    },
    {
      title:"Permissões Total",
      value:"127",
      trend:"Sistema",
      icon: Lock,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
    },
    {
      title:"Acessos Hoje",
      value:"38",
      trend:"+12%",
      icon: Activity,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      ativo:"var(--orx-success)",
      inativo:"var(--orx-gray-500)",
      bloqueado:"var(--orx-error)",
    };
    return colors[status as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ativo:"Ativo",
      inativo:"Inativo",
      bloqueado:"Bloqueado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day:"2-digit",
      month:"2-digit",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontSize: '0.813rem',
                fontFamily:"var(--orx-font-family)",
                fontWeight: 600,
                color:"var(--orx-text-primary)",
                marginBottom:"0.5rem",
              }}
            >
              Gestão de Usuários e Permissões
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Controle de acesso baseado em papéis (RBAC)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="neumorphic-button flex items-center gap-2 px-6 py-3 rounded-xl"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
                color:"white",
                fontWeight: 600,
                fontSize: '0.813rem',
                border:"none",
                boxShadow:"0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <UserPlus size={18} />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6 rounded-2xl"
              style={{
                background:"var(--orx-bg-light)",
                boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width:"56px",
                    height:"56px",
                    background: kpi.iconBg,
                    boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <kpi.icon size={24} color="#ffffff" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color:"var(--orx-text-secondary)",
                      fontFamily:"var(--orx-font-family)",
                      marginBottom:"0.25rem",
                    }}
                  >
                    {kpi.title}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    color:"var(--orx-text-primary)",
                    fontFamily:"var(--orx-font-family)",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.color,
                    fontFamily:"var(--orx-font-family)",
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="neumorphic-card p-2 rounded-2xl inline-flex gap-2"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <button
            onClick={() => setActiveTab("usuarios")}
            className="px-6 py-3 rounded-xl flex items-center gap-2"
            style={{
              background:
                activeTab ==="usuarios"
                  ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                  :"transparent",
              color: activeTab ==="usuarios" ?"white" :"var(--orx-text-primary)",
              fontWeight: 600,
              fontSize: '0.813rem',
              border:"none",
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}
          >
            <Users size={18} />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className="px-6 py-3 rounded-xl flex items-center gap-2"
            style={{
              background:
                activeTab ==="roles"
                  ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                  :"transparent",
              color: activeTab ==="roles" ?"white" :"var(--orx-text-primary)",
              fontWeight: 600,
              fontSize: '0.813rem',
              border:"none",
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}
          >
            <Shield size={18} />
            Papéis (Roles)
          </button>
        </div>

        {/* Search and Filters */}
        <div
          className="neumorphic-card p-6 rounded-2xl"
          style={{
            background:"var(--orx-bg-light)",
            boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                style={{ color:"var(--orx-text-secondary)" }}
              />
              <input
                type="text"
                placeholder={
                  activeTab ==="usuarios"
                    ?"Buscar usuários por nome, email ou cargo..."
                    :"Buscar papéis por nome ou descrição..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"inset 2px 2px 4px rgba(0, 0, 0, 0.1)",
                  border:"1px solid rgba(99, 102, 241, 0.2)",
                  fontSize: '0.813rem',
                  fontFamily:"var(--orx-font-family)",
                  color:"var(--orx-text-primary)",
                }}
              />
            </div>

            {activeTab ==="usuarios" && (
              <div className="flex items-center gap-2">
                <Filter size={20} style={{ color:"var(--orx-text-secondary)" }} />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background:"var(--orx-bg-light)",
                    boxShadow:"inset 2px 2px 4px rgba(0, 0, 0, 0.1)",
                    border:"1px solid rgba(99, 102, 241, 0.2)",
                    fontSize: '0.813rem',
                    fontFamily:"var(--orx-font-family)",
                    color:"var(--orx-text-primary)",
                  }}
                >
                  <option value="todos">Todos os papéis</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Analista">Analista</option>
                  <option value="Operador">Operador</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content - Usuários */}
        {activeTab ==="usuarios" && (
          <div
            className="neumorphic-card p-6 rounded-2xl"
            style={{
              background:"var(--orx-bg-light)",
              boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom:"2px solid rgba(99, 102, 241, 0.1)" }}>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"left",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Usuário
                    </th>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"left",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Cargo
                    </th>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"left",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Papel (Role)
                    </th>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"left",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Último Acesso
                    </th>
                    <th
                      style={{
                        padding:"1rem",
                        textAlign:"center",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color:"var(--orx-text-secondary)",
                        fontFamily:"var(--orx-font-family)",
                      }}
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom:"1px solid rgba(99, 102, 241, 0.05)" }}
                    >
                      <td style={{ padding:"1rem" }}>
                        <div>
                          <p
                            style={{
                              fontSize: '0.813rem',
                              fontFamily:"var(--orx-font-family)",
                              color:"var(--orx-text-primary)",
                              fontWeight: 600,
                              marginBottom:"0.25rem",
                            }}
                          >
                            {user.nome}
                          </p>
                          <p
                            style={{
                              fontSize: '0.813rem',
                              fontFamily:"var(--orx-font-family)",
                              color:"var(--orx-text-secondary)",
                            }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td
                        style={{
                          padding:"1rem",
                          fontSize: '0.813rem',
                          fontFamily:"var(--orx-font-family)",
                          color:"var(--orx-text-primary)",
                        }}
                      >
                        {user.cargo}
                      </td>
                      <td style={{ padding:"1rem" }}>
                        <span
                          style={{
                            display:"inline-flex",
                            alignItems:"center",
                            gap:"0.5rem",
                            padding:"0.375rem 0.75rem",
                            borderRadius:"0.5rem",
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily:"var(--orx-font-family)",
                            background:"var(--orx-primary)15",
                            color:"var(--orx-primary)",
                          }}
                        >
                          <Shield size={14} />
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding:"1rem", textAlign:"center" }}>
                        <span
                          style={{
                            display:"inline-block",
                            padding:"0.375rem 0.75rem",
                            borderRadius:"0.5rem",
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily:"var(--orx-font-family)",
                            background: `${getStatusColor(user.status)}15`,
                            color: getStatusColor(user.status),
                          }}
                        >
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding:"1rem",
                          fontSize: '0.813rem',
                          fontFamily:"var(--orx-font-family)",
                          color:"var(--orx-text-secondary)",
                        }}
                      >
                        {formatDate(user.ultimoAcesso)}
                      </td>
                      <td style={{ padding:"1rem", textAlign:"center" }}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar usuário"
                            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                              padding:"0.5rem",
                              borderRadius:"0.5rem",
                              background:"var(--orx-bg-light)",
                              boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                              border:"none",
                              cursor:"pointer",
                            }}
                          >
                            <Edit size={16} style={{ color:"var(--orx-primary)" }} />
                          </button>
                          <button
                            title="Gerenciar permissões"
                            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                              padding:"0.5rem",
                              borderRadius:"0.5rem",
                              background:"var(--orx-bg-light)",
                              boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                              border:"none",
                              cursor:"pointer",
                            }}
                          >
                            <Key size={16} style={{ color:"var(--orx-success)" }} />
                          </button>
                          <button
                            title="Excluir usuário"
                            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                              padding:"0.5rem",
                              borderRadius:"0.5rem",
                              background:"var(--orx-bg-light)",
                              boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                              border:"none",
                              cursor:"pointer",
                            }}
                          >
                            <Trash2 size={16} style={{ color:"var(--orx-error)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content - Roles */}
        {activeTab ==="roles" && (
          <div className="grid grid-cols-2 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="neumorphic-card p-6 rounded-2xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width:"48px",
                        height:"48px",
                        background: `${role.cor}15`,
                      }}
                    >
                      <Shield size={24} style={{ color: role.cor }} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          color:"var(--orx-text-primary)",
                          fontFamily:"var(--orx-font-family)",
                          marginBottom:"0.25rem",
                        }}
                      >
                        {role.nome}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          color:"var(--orx-text-secondary)",
                          fontFamily:"var(--orx-font-family)",
                        }}
                      >
                        {role.descricao}
                      </p>
                    </div>
                  </div>
                  <button
                    title="Editar papel"
                    style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                      padding:"0.5rem",
                      borderRadius:"0.5rem",
                      background:"var(--orx-bg-light)",
                      boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)",
                      border:"none",
                      cursor:"pointer",
                    }}
                  >
                    <Edit size={16} style={{ color:"var(--orx-primary)" }} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          color:"var(--orx-text-secondary)",
                          fontFamily:"var(--orx-font-family)",
                          marginBottom:"0.25rem",
                        }}
                      >
                        Usuários
                      </p>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          color:"var(--orx-text-primary)",
                          fontFamily:"var(--orx-font-family)",
                        }}
                      >
                        {role.usuarios}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          color:"var(--orx-text-secondary)",
                          fontFamily:"var(--orx-font-family)",
                          marginBottom:"0.25rem",
                        }}
                      >
                        Permissões
                      </p>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          color:"var(--orx-text-primary)",
                          fontFamily:"var(--orx-font-family)",
                        }}
                      >
                        {role.permissoes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

