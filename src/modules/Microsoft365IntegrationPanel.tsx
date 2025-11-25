/**
 * MICROSOFT 365 INTEGRATION PANEL - ICARUS v5.0
 * Teams, Outlook, OneDrive integration
 */

import { useState } from 'react';
import {
  Video,
  Calendar,
  Mail,
  FolderOpen,
  Users,
  Clock,
  Plus,
  Send,
  TrendingUp,
} from 'lucide-react';
import { ModulePage } from '@/components/templates/ModulePage';
import { Button } from '@/components/oraclusx-ds/Button';

interface Meeting {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  participantes: number;
  tipo: 'hospital' | 'plano' | 'industria';
  status: 'agendada' | 'em_andamento' | 'concluida';
  joinUrl?: string;
}

export default function Microsoft365IntegrationPanel() {
  const [selectedTab, setSelectedTab] = useState<'teams' | 'calendar' | 'email'>('teams');

  const meetings: Meeting[] = [
    {
      id: '1',
      titulo: 'Apresentação Próteses Ortopédicas - Hospital Santa Maria',
      inicio: '2025-10-25T09:00:00',
      fim: '2025-10-25T10:00:00',
      participantes: 5,
      tipo: 'hospital',
      status: 'agendada',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/...',
    },
    {
      id: '2',
      titulo: 'Negociação Contrato - Unimed Regional',
      inicio: '2025-10-25T14:00:00',
      fim: '2025-10-25T15:30:00',
      participantes: 3,
      tipo: 'plano',
      status: 'agendada',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/...',
    },
    {
      id: '3',
      titulo: 'Treinamento Equipe Cirúrgica - Stents',
      inicio: '2025-10-24T10:00:00',
      fim: '2025-10-24T12:00:00',
      participantes: 12,
      tipo: 'hospital',
      status: 'concluida',
    },
  ];

  const kpis = [
    {
      title: 'Reuniões (Mês)',
      value: '24',
      trend: '+8',
      icon: Video,
      iconBg: 'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
      color: 'var(--orx-primary)',
    },
    {
      title: 'E-mails Enviados',
      value: '187',
      trend: '+23',
      icon: Mail,
      iconBg: 'linear-gradient(135deg, var(--orx-success), #059669)',
      color: 'var(--orx-success)',
    },
    {
      title: 'Eventos Calendário',
      value: '15',
      trend: '+3',
      icon: Calendar,
      iconBg: 'linear-gradient(135deg, var(--orx-warning), #D97706)',
      color: 'var(--orx-warning)',
    },
    {
      title: 'Arquivos OneDrive',
      value: '342',
      trend: '+45',
      icon: FolderOpen,
      iconBg: 'linear-gradient(135deg, var(--orx-purple-500), #7C3AED)',
      color: 'var(--orx-purple-500)',
    },
  ];

  const getTipoLabel = (tipo: string) => {
    const labels = {
      hospital: 'Hospital',
      plano: 'Plano de Saúde',
      industria: 'Indústria',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      hospital: 'var(--orx-primary)',
      plano: 'var(--orx-success)',
      industria: 'var(--orx-warning)',
    };
    return colors[tipo as keyof typeof colors] || 'var(--orx-gray-500)';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      agendada: 'Agendada',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      agendada: 'var(--orx-warning)',
      em_andamento: 'var(--orx-primary)',
      concluida: 'var(--orx-success)',
    };
    return colors[status as keyof typeof colors] || 'var(--orx-gray-500)';
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <ModulePage
      title="Microsoft 365 Integration"
      description="Teams, Outlook, OneDrive integration"
      icon={<Video aria-hidden="true" className="h-5 w-5" />}
      actions={
        <Button
          variant="neumorphic"
          size="default"
          className="inline-flex items-center gap-2"
          onClick={() => window.dispatchEvent(new CustomEvent('icarus:nova-reuniao-teams'))}
        >
          <Plus size={18} strokeWidth={1.5} className="flex-shrink-0" />
          <span>Nova Reunião Teams</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6 rounded-2xl"
              style={{
                background: 'var(--orx-bg-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: kpi.iconBg,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <kpi.icon size={24} color="#ffffff" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                      marginBottom: '0.25rem',
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
                    color: 'var(--orx-text-primary)',
                    fontFamily: 'var(--orx-font-family)',
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
                    fontFamily: 'var(--orx-font-family)',
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
            background: 'var(--orx-bg-light)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Button
            variant={selectedTab === 'teams' ? 'neumorphic' : 'ghost'}
            size="default"
            className={`px-6 py-3 rounded-xl flex items-center gap-2 ${selectedTab === 'teams' ? 'neumorphic-button-active' : ''}`}
            onClick={() => setSelectedTab('teams')}
          >
            <Video size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Teams</span>
          </Button>
          <Button
            variant={selectedTab === 'calendar' ? 'neumorphic' : 'ghost'}
            size="default"
            className={`px-6 py-3 rounded-xl flex items-center gap-2 ${selectedTab === 'calendar' ? 'neumorphic-button-active' : ''}`}
            onClick={() => setSelectedTab('calendar')}
          >
            <Calendar size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Calendário</span>
          </Button>
          <Button
            variant={selectedTab === 'email' ? 'neumorphic' : 'ghost'}
            size="default"
            className={`px-6 py-3 rounded-xl flex items-center gap-2 ${selectedTab === 'email' ? 'neumorphic-button-active' : ''}`}
            onClick={() => setSelectedTab('email')}
          >
            <Mail size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Outlook</span>
          </Button>
        </div>

        {/* Teams Meetings */}
        {selectedTab === 'teams' && (
          <div className="grid grid-cols-1 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="neumorphic-card p-6 rounded-2xl"
                style={{
                  background: 'var(--orx-bg-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width: '56px',
                        height: '56px',
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
                            color: 'var(--orx-text-primary)',
                            fontFamily: 'var(--orx-font-family)',
                          }}
                        >
                          {meeting.titulo}
                        </h3>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily: 'var(--orx-font-family)',
                            background: `${getTipoColor(meeting.tipo)}15`,
                            color: getTipoColor(meeting.tipo),
                          }}
                        >
                          {getTipoLabel(meeting.tipo)}
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            fontFamily: 'var(--orx-font-family)',
                            background: `${getStatusColor(meeting.status)}15`,
                            color: getStatusColor(meeting.status),
                          }}
                        >
                          {getStatusLabel(meeting.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: 'var(--orx-text-secondary)' }} />
                          <span
                            style={{
                              fontSize: '0.813rem',
                              color: 'var(--orx-text-secondary)',
                              fontFamily: 'var(--orx-font-family)',
                            }}
                          >
                            {formatDateTime(meeting.inicio)} -{' '}
                            {new Date(meeting.fim).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: 'var(--orx-text-secondary)' }} />
                          <span
                            style={{
                              fontSize: '0.813rem',
                              color: 'var(--orx-text-secondary)',
                              fontFamily: 'var(--orx-font-family)',
                            }}
                          >
                            {meeting.participantes} participantes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {meeting.status === 'agendada' && meeting.joinUrl && (
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        fontFamily: 'var(--orx-font-family)',
                        background:
                          'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Video size={16} />
                      Entrar na Reunião
                    </button>
                  )}
                  <Button
                    variant="neumorphic"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('icarus:enviar-email', { detail: meeting.id })
                      )
                    }
                  >
                    <Send size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>Enviar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar & Email placeholders */}
        {selectedTab !== 'teams' && (
          <div
            className="neumorphic-card p-12 rounded-2xl text-center"
            style={{
              background: 'var(--orx-bg-light)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
              }}
            >
              {selectedTab === 'calendar' ? (
                <Calendar size={40} color="#ffffff" />
              ) : (
                <Mail size={40} color="#ffffff" />
              )}
            </div>
            <h3
              style={{
                fontSize: '0.813rem',
                fontWeight: 600,
                color: 'var(--orx-text-primary)',
                fontFamily: 'var(--orx-font-family)',
                marginBottom: '0.5rem',
              }}
            >
              {selectedTab === 'calendar' ? 'Calendário Outlook' : 'E-mail Outlook'}
            </h3>
            <p
              style={{
                fontSize: '0.813rem',
                color: 'var(--orx-text-secondary)',
                fontFamily: 'var(--orx-font-family)',
              }}
            >
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </ModulePage>
  );
}
