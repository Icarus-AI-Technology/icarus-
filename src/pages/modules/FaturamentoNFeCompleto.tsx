/**
 * FATURAMENTO NF-e COMPLETO - ICARUS v5.0
 * Emissão, consulta e gerenciamento de Notas Fiscais Eletrônicas
 */

import { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Printer,
  RefreshCcw,
  Mail,
} from 'lucide-react';
import { ModulePage } from '@/components/templates/ModulePage';
import { Button } from '@/components/oraclusx-ds/Button';

interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso: string;
  destinatario: string;
  cnpj: string;
  valor: number;
  status: 'emitida' | 'autorizada' | 'cancelada' | 'denegada' | 'rejeitada';
  emissaoEm: string;
  protocolo?: string;
}

export default function FaturamentoNFeCompleto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todas');

  // Mock data
  const nfes: NFe[] = [
    {
      id: '1',
      numero: '000.123.456',
      serie: '1',
      chaveAcesso: '35231234567890123456789012345678901234567890',
      destinatario: 'Hospital Santa Maria',
      cnpj: '12.345.678/0001-90',
      valor: 45800.0,
      status: 'autorizada',
      emissaoEm: '2025-10-20T10:30:00',
      protocolo: '135230012345678',
    },
    {
      id: '2',
      numero: '000.123.457',
      serie: '1',
      chaveAcesso: '35231234567890123456789012345678901234567891',
      destinatario: 'Clínica Ortopédica Silva',
      cnpj: '98.765.432/0001-10',
      valor: 28300.0,
      status: 'autorizada',
      emissaoEm: '2025-10-20T11:15:00',
      protocolo: '135230012345679',
    },
    {
      id: '3',
      numero: '000.123.458',
      serie: '1',
      chaveAcesso: '35231234567890123456789012345678901234567892',
      destinatario: 'Hospital São Lucas',
      cnpj: '11.222.333/0001-44',
      valor: 67200.0,
      status: 'emitida',
      emissaoEm: '2025-10-20T14:20:00',
    },
  ];

  const kpis = [
    {
      title: 'NF-e Emitidas Hoje',
      value: '12',
      trend: '+3',
      icon: FileText,
      bgClass: 'bg-gradient-to-br from-[var(--orx-primary)] to-[var(--orx-primary-hover)]',
      textClass: 'text-[var(--orx-primary)]',
    },
    {
      title: 'Autorizadas',
      value: '10',
      trend: '83%',
      icon: CheckCircle,
      bgClass: 'bg-gradient-to-br from-[var(--orx-success)] to-[#059669]',
      textClass: 'text-[var(--orx-success)]',
    },
    {
      title: 'Aguardando',
      value: '2',
      trend: '17%',
      icon: Clock,
      bgClass: 'bg-gradient-to-br from-[var(--orx-warning)] to-[#D97706]',
      textClass: 'text-[var(--orx-warning)]',
    },
    {
      title: 'Valor Total',
      value: 'R$ 186K',
      trend: '+12%',
      icon: TrendingUp,
      bgClass: 'bg-gradient-to-br from-[var(--orx-purple-500)] to-[#7C3AED]',
      textClass: 'text-[var(--orx-purple-500)]',
    },
  ];

  const getStatusLabel = (status: string) => {
    const labels = {
      autorizada: 'Autorizada',
      emitida: 'Emitida',
      cancelada: 'Cancelada',
      denegada: 'Denegada',
      rejeitada: 'Rejeitada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusBadgeClasses = (status: string) => {
    const classes: Record<string, string> = {
      autorizada: 'bg-success/10 text-success',
      emitida: 'bg-warning/10 text-warning',
      cancelada: 'bg-[var(--orx-gray-500)]/15 text-[var(--orx-gray-500)]',
      denegada: 'bg-error/10 text-error',
      rejeitada: 'bg-[var(--orx-error-dark)]/15 text-[var(--orx-error-dark)]',
    };
    return classes[status] || 'bg-[var(--orx-gray-500)]/15 text-[var(--orx-gray-500)]';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
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
      title="Faturamento NF-e Completo"
      description="Emissão, consulta e gerenciamento de Notas Fiscais Eletrônicas"
      icon={<FileText aria-hidden="true" className="h-5 w-5" />}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:refresh-faturamento'))}
          >
            <RefreshCcw size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Atualizar</span>
          </Button>
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:nova-nfe'))}
          >
            <Plus size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Nova NF-e</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`flex items-center justify-center rounded-2xl w-14 h-14 shadow-orx-medium ${kpi.bgClass}`}
                >
                  <kpi.icon size={24} color="var(--orx-text-white)" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mb-1">
                    {kpi.title}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-text-primary)] leading-none">
                  {kpi.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[0.813rem] orx-orx-font-semibold ${kpi.textClass}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--orx-text-secondary)]"
              />
              <input
                type="text"
                placeholder="Buscar por número, destinatário, CNPJ ou chave de acesso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-inner-orx border border-[rgba(99,102,241,0.2)]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} strokeWidth={1.5} className="text-[var(--orx-text-secondary)]" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] shadow-inner-orx border border-[rgba(99,102,241,0.2)]"
              >
                <option value="todas">Todas</option>
                <option value="autorizada">Autorizadas</option>
                <option value="emitida">Emitidas</option>
                <option value="cancelada">Canceladas</option>
                <option value="rejeitada">Rejeitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* NF-e Table */}
        <div className="neumorphic-card p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow-orx-soft">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.1)]">
                  <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Número
                  </th>
                  <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Destinatário
                  </th>
                  <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    CNPJ
                  </th>
                  <th className="p-4 text-right text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Valor
                  </th>
                  <th className="p-4 text-center text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Status
                  </th>
                  <th className="p-4 text-left text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Emissão
                  </th>
                  <th className="p-4 text-center text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {nfes.map((nfe) => (
                  <tr key={nfe.id} className="border-b border-[rgba(99,102,241,0.05)]">
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)] orx-orx-font-semibold">
                      {nfe.numero}
                    </td>
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)]">
                      {nfe.destinatario}
                    </td>
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-secondary)]">
                      {nfe.cnpj}
                    </td>
                    <td className="p-4 text-right text-[0.813rem] text-[var(--orx-text-primary)] orx-orx-font-semibold">
                      {formatCurrency(nfe.valor)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-[0.813rem] orx-orx-font-semibold ${getStatusBadgeClasses(nfe.status)}`}
                      >
                        {getStatusLabel(nfe.status)}
                      </span>
                    </td>
                    <td className="p-4 text-[0.813rem] text-[var(--orx-text-secondary)]">
                      {formatDate(nfe.emissaoEm)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="neumorphic"
                          size="icon"
                          className="rounded-xl"
                          title="Imprimir DANFE"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('icarus:imprimir-danfe', { detail: nfe.id })
                            )
                          }
                        >
                          <Printer
                            size={16}
                            strokeWidth={1.5}
                            className="text-[var(--orx-primary)]"
                          />
                        </Button>
                        <Button
                          variant="neumorphic"
                          size="icon"
                          className="rounded-xl"
                          title="Download XML"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('icarus:download-xml', { detail: nfe.id })
                            )
                          }
                        >
                          <Download
                            size={16}
                            strokeWidth={1.5}
                            className="text-[var(--orx-success)]"
                          />
                        </Button>
                        <Button
                          variant="neumorphic"
                          size="icon"
                          className="rounded-xl"
                          title="Enviar por E-mail"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('icarus:enviar-email', { detail: nfe.id })
                            )
                          }
                        >
                          <Mail
                            size={16}
                            strokeWidth={1.5}
                            className="text-[var(--orx-purple-500)]"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
