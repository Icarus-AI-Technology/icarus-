/**
 * Cadastro de Transportadoras - ICARUS v5.0
 * Design System: OraclusX DS - Neumórfico 3D Premium
 *
 * Formulário completo para cadastro de transportadoras
 * com integração de APIs e design neumórfico padronizado.
 */

import { useState } from 'react';
import { ArrowLeft, Truck, MapPin, Link as LinkIcon, Star, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/oraclusx-ds/Input';
import { Button } from '@/components/oraclusx-ds/Button';
import { Select } from '@/components/oraclusx-ds/Select';
import { useDocumentTitle } from '@/hooks';

interface TransportadoraFormData {
  nome: string;
  cnpj?: string;
  tipo: 'rodoviario' | 'aereo' | 'courier' | 'multimodal' | '';
  telefone?: string;
  email?: string;
  site?: string;
  prazo_entrega_medio?: number;
  custo_km?: number;
  raio_atendimento?: number;
  horario_coleta?: string;
  possui_api: boolean;
  api_url?: string;
  api_token?: string;
  api_auth_type?: 'bearer' | 'basic' | 'api_key' | 'oauth2' | '';
  avaliacao?: number;
  observacoes?: string;
}

const INITIAL_STATE: TransportadoraFormData = {
  nome: '',
  tipo: '',
  possui_api: false,
};

const TIPOS_TRANSPORTE = [
  { value: 'rodoviario', label: 'Rodoviário' },
  { value: 'aereo', label: 'Aéreo' },
  { value: 'courier', label: 'Courier (Motoboy/Entrega Rápida)' },
  { value: 'multimodal', label: 'Multimodal' },
];

const TIPOS_AUTH = [
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
];

export default function CadastroTransportadoras() {
  useDocumentTitle('Cadastro de Transportadoras');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TransportadoraFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome) {
      toast.error('Nome da transportadora é obrigatório');
      return;
    }

    if (!formData.tipo) {
      toast.error('Tipo de transporte é obrigatório');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Transportadora cadastrada com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar transportadora');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/cadastros')}
              className="p-3 rounded-lg flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)]">
                Cadastro de Transportadoras
              </h1>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
                Configure empresas de transporte e logística
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Institucionais */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Truck size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Dados Institucionais
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  variant="neumo"
                  id="nome"
                  label="Nome da Transportadora *"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Transportes Rápidos Ltda"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="cnpj"
                  label="CNPJ"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <Select
                  label="Tipo de Transporte *"
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      tipo: (value ?? formData.tipo) as TransportadoraFormData['tipo'],
                    })
                  }
                  options={TIPOS_TRANSPORTE}
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="telefone"
                  label="Telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="email"
                  label="E-mail"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@transportadora.com.br"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="site"
                  label="Website"
                  value={formData.site || ''}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="https://www.transportadora.com.br"
                />
              </div>
            </div>
          </div>

          {/* Dados Operacionais */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <MapPin size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Dados Operacionais
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  variant="neumo"
                  id="prazo_entrega_medio"
                  label="Prazo Médio Entrega (dias)"
                  type="number"
                  value={formData.prazo_entrega_medio || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prazo_entrega_medio: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Ex: 3"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="custo_km"
                  label="Custo por KM (R$)"
                  type="number"
                  step="0.01"
                  value={formData.custo_km || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, custo_km: parseFloat(e.target.value) || undefined })
                  }
                  placeholder="Ex: 1.50"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="raio_atendimento"
                  label="Raio de Atendimento (km)"
                  type="number"
                  value={formData.raio_atendimento || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      raio_atendimento: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="horario_coleta"
                  label="Horário de Coleta"
                  value={formData.horario_coleta || ''}
                  onChange={(e) => setFormData({ ...formData, horario_coleta: e.target.value })}
                  placeholder="Ex: 08:00 - 18:00"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-2">
                Avaliação
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, avaliacao: star })}
                    className="focus:outline-none transition-transform active:scale-95"
                    aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ${
                        (formData.avaliacao || 0) >= star
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                          : 'text-[var(--orx-text-muted)]'
                      }`}
                    />
                  </button>
                ))}
                {formData.avaliacao && (
                  <span className="ml-2 text-[0.813rem] text-[var(--orx-text-secondary)]">
                    {formData.avaliacao}/5
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Integração API */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <LinkIcon size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Integração de API
              </h2>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.possui_api}
                  onChange={(e) => setFormData({ ...formData, possui_api: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--orx-border-subtle)] text-[var(--orx-primary)] focus:ring-[var(--orx-primary)]"
                />
                <span className="text-[0.813rem] text-[var(--orx-text-primary)]">
                  Esta transportadora possui API de rastreamento
                </span>
              </label>
            </div>

            {formData.possui_api && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      variant="neumo"
                      id="api_url"
                      label="URL da API"
                      value={formData.api_url || ''}
                      onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                      placeholder="https://api.transportadora.com.br/v1"
                    />
                  </div>

                  <div>
                    <Select
                      label="Tipo de Autenticação"
                      value={formData.api_auth_type || ''}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          api_auth_type: (value ?? formData.api_auth_type) as TransportadoraFormData['api_auth_type'],
                        })
                      }
                      options={TIPOS_AUTH}
                    />
                  </div>

                  <div>
                    <label className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-2">
                      Token/Chave de API
                    </label>
                    <div className="relative">
                      <input
                        type={showApiToken ? 'text' : 'password'}
                        value={formData.api_token || ''}
                        onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="flex h-10 w-full rounded-md border border-[var(--orx-border-subtle)] bg-[var(--orx-bg-input)] px-3 py-2 pr-10 text-[var(--orx-text-primary)] text-[0.813rem] shadow-[var(--orx-shadow-inner)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orx-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--orx-text-muted)] hover:text-[var(--orx-text-primary)]"
                      >
                        {showApiToken ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="mb-4">
              <label className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre a transportadora..."
                rows={4}
                className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all min-h-[100px]"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate('/cadastros')}
              disabled={loading}
              className="px-6 py-3"
            >
              Cancelar
            </Button>

            <Button
              variant="solid"
              color="primary"
              type="submit"
              disabled={loading}
              className="px-6 py-3 flex items-center gap-2"
            >
              {loading ? 'Salvando...' : 'Salvar Transportadora'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
