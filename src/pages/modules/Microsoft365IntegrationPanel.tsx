/**
 * MICROSOFT 365 INTEGRATION PANEL - ICARUS v5.0
 * Teams, Outlook, OneDrive integration
 */

import { useState } from"react";
import {
  Video,
  Calendar,
  Mail,
  FolderOpen,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Download,
  Send,
  TrendingUp,
} from"lucide-react";

interface Meeting {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  participantes: number;
  tipo:"hospital" |"plano" |"industria";
  status:"agendada" |"em_andamento" |"concluida";
  joinUrl?: string;
}

export default function Microsoft365IntegrationPanel() {
  const [selectedTab, setSelectedTab] = useState<"teams" |"calendar" |"email">("teams");

  const meetings: Meeting[] = [
    {
      id:"1",
      titulo:"Apresentação Próteses Ortopédicas - Hospital Santa Maria",
      inicio:"2025-10-25T09:00:00",
      fim:"2025-10-25T10:00:00",
      participantes: 5,
      tipo:"hospital",
      status:"agendada",
      joinUrl:"https://teams.microsoft.com/l/meetup-join/...",
    },
    {
      id:"2",
      titulo:"Negociação Contrato - Unimed Regional",
      inicio:"2025-10-25T14:00:00",
      fim:"2025-10-25T15:30:00",
      participantes: 3,
      tipo:"plano",
      status:"agendada",
      joinUrl:"https://teams.microsoft.com/l/meetup-join/...",
    },
    {
      id:"3",
      titulo:"Treinamento Equipe Cirúrgica - Stents",
      inicio:"2025-10-24T10:00:00",
      fim:"2025-10-24T12:00:00",
      participantes: 12,
      tipo:"hospital",
      status:"concluida",
    },
  ];

  const kpis = [
    {
      title:"Reuniões (Mês)",
      value:"24",
      trend:"+8",
      icon: Video,
      iconBg:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
      color:"var(--orx-primary)",
    },
    {
      title:"E-mails Enviados",
      value:"187",
      trend:"+23",
      icon: Mail,
      iconBg:"linear-gradient(135deg, var(--orx-success), #059669)",
      color:"var(--orx-success)",
    },
    {
      title:"Eventos Calendário",
      value:"15",
      trend:"+3",
      icon: Calendar,
      iconBg:"linear-gradient(135deg, var(--orx-warning), #D97706)",
      color:"var(--orx-warning)",
    },
    {
      title:"Arquivos OneDrive",
      value:"342",
      trend:"+45",
      icon: FolderOpen,
      iconBg:"linear-gradient(135deg, var(--orx-purple-500), #7C3AED)",
      color:"var(--orx-purple-500)",
    },
  ];

  const getTipoLabel = (tipo: string) => {
    const labels = {
      hospital:"Hospital",
      plano:"Plano de Saúde",
      industria:"Indústria",
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      hospital:"var(--orx-primary)",
      plano:"var(--orx-success)",
      industria:"var(--orx-warning)",
    };
    return colors[tipo as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      agendada:"Agendada",
      em_andamento:"Em Andamento",
      concluida:"Concluída",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      agendada:"var(--orx-warning)",
      em_andamento:"var(--orx-primary)",
      concluida:"var(--orx-success)",
    };
    return colors[status as keyof typeof colors] ||"var(--orx-gray-500)";
  };

  const formatDateTime = (date: string) => {
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
              Microsoft 365 Integration
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Teams, Outlook, OneDrive integration
            </p>
          </div>

          {/* Action Button */}
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
            <Plus size={18} />
            Nova Reunião Teams
          </button>
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
                <TrendingUp size={16} style={{ color: kpi.color }} />
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
            onClick={() => setSelectedTab("teams")}
            className="px-6 py-3 rounded-xl flex items-center gap-2"
            style={{
              background:
                selectedTab ==="teams"
                  ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                  :"transparent",
              color: selectedTab ==="teams" ?"white" :"var(--orx-text-primary)",
              fontWeight: 600,
              fontSize: '0.813rem',
              border:"none",
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}
          >
            <Video size={18} />
            Teams Meetings
          </button>
          <button
            onClick={() => setSelectedTab("calendar")}
            className="px-6 py-3 rounded-xl flex items-center gap-2"
            style={{
              background:
                selectedTab ==="calendar"
                  ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                  :"transparent",
              color: selectedTab ==="calendar" ?"white" :"var(--orx-text-primary)",
              fontWeight: 600,
              fontSize: '0.813rem',
              border:"none",
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}
          >
            <Calendar size={18} />
            Calendário
          </button>
          <button
            onClick={() => setSelectedTab("email")}
            className="px-6 py-3 rounded-xl flex items-center gap-2"
            style={{
              background:
                selectedTab ==="email"
                  ?"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))"
                  :"transparent",
              color: selectedTab ==="email" ?"white" :"var(--orx-text-primary)",
              fontWeight: 600,
              fontSize: '0.813rem',
              border:"none",
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}
          >
            <Mail size={18} />
            E-mail
          </button>
        </div>

        {/* Teams Meetings */}
        {selectedTab ==="teams" && (
          <div className="grid grid-cols-1 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="neumorphic-card p-6 rounded-2xl"
                style={{
                  background:"var(--orx-bg-light)",
                  boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width:"56px",
                        height:"56px",
                        background: `${getTipoColor(meeting.tipo)}15`,
                      }}
                    >
                      <Video size={28} style={{ color: getTipoColor(meeting.tipo) }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          style={{
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            color:"var(--orx-text-primary)",
                            fontFamily:"var(--orx-font-family)",
                          }}
                        >
                          {meeting.titulo}
                        </h3>
                        <span
                          style={{
                            display:"inline-block",
                            padding:"0.25rem 0.5rem",
                            borderRadius:"0.375rem",
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily:"var(--orx-font-family)",
                            background: `${getTipoColor(meeting.tipo)}15`,
                            color: getTipoColor(meeting.tipo),
                          }}
                        >
                          {getTipoLabel(meeting.tipo)}
                        </span>
                        <span
                          style={{
                            display:"inline-block",
                            padding:"0.25rem 0.5rem",
                            borderRadius:"0.375rem",
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily:"var(--orx-font-family)",
                            background: `${getStatusColor(meeting.status)}15`,
                            color: getStatusColor(meeting.status),
                          }}
                        >
                          {getStatusLabel(meeting.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color:"var(--orx-text-secondary)" }} />
                          <span
                            style={{
                              fontSize: '0.813rem',
                              color:"var(--orx-text-secondary)",
                              fontFamily:"var(--orx-font-family)",
                            }}
                          >
                            {formatDateTime(meeting.inicio)} - {new Date(meeting.fim).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color:"var(--orx-text-secondary)" }} />
                          <span
                            style={{
                              fontSize: '0.813rem',
                              color:"var(--orx-text-secondary)",
                              fontFamily:"var(--orx-font-family)",
                            }}
                          >
                            {meeting.participantes} participantes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {meeting.status ==="agendada" && meeting.joinUrl && (
                    <button
                      style={{
                        padding:"0.75rem 1.5rem",
                        borderRadius:"0.75rem",
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        fontFamily:"var(--orx-font-family)",
                        background:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
                        color:"white",
                        border:"none",
                        boxShadow:"0 2px 8px rgba(99, 102, 241, 0.3)",
                        cursor:"pointer",
                        display:"flex",
                        alignItems:"center",
                        gap:"0.5rem",
                      }}
                    >
                      <Video size={16} />
                      Entrar na Reunião
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar & Email placeholders */}
        {selectedTab !=="teams" && (
          <div
            className="neumorphic-card p-12 rounded-2xl text-center"
            style={{
              background:"var(--orx-bg-light)",
              boxShadow:"0 4px 16px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{
                width:"80px",
                height:"80px",
                background:"linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))",
              }}
            >
              {selectedTab ==="calendar" ? (
                <Calendar size={40} color="#ffffff" />
              ) : (
                <Mail size={40} color="#ffffff" />
              )}
            </div>
            <h3
              style={{
                fontSize: '0.813rem',
                fontWeight: 600,
                color:"var(--orx-text-primary)",
                fontFamily:"var(--orx-font-family)",
                marginBottom:"0.5rem",
              }}
            >
              {selectedTab ==="calendar" ?"Calendário Outlook" :"E-mail Outlook"}
            </h3>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                fontFamily:"var(--orx-font-family)",
              }}
            >
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

