/**
 * Cadastro de Transportadoras - ICARUS v5.0
 * Design System: OraclusX DS - Neumórfico 3D Premium
 * 
 * Formulário completo para cadastro de transportadoras
 * com integração de APIs e design neumórfico padronizado.
 */

import { useState } from 'react';
import { ArrowLeft, Truck, Phone, MapPin, Link as LinkIcon, DollarSign, Star, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NeumoInput, NeumoTextarea, NeumoButton } from '@/components/oraclusx-ds';
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
  possui_api: false
};

const TIPOS_TRANSPORTE = [
  { value: 'rodoviario', label: 'Rodoviário' },
  { value: 'aereo', label: 'Aéreo' },
  { value: 'courier', label: 'Courier (Motoboy/Entrega Rápida)' },
  { value: 'multimodal', label: 'Multimodal' }
];

const TIPOS_AUTH = [
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' }
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Transportadora salva:', formData);
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
        <div className="mb-6">
          <NeumoButton
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/cadastros')}
            className="mb-4"
          >
            Voltar
          </NeumoButton>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
              <Truck className="w-6 h-6 text-orx-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orx-text-primary">
                Cadastro de Transportadoras
              </h1>
              <p className="text-orx-text-secondary mt-1">
                Configure empresas de transporte e logística
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Institucionais */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <h2 className="text-lg font-semibold text-orx-text-primary mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orx-primary" />
              Dados Institucionais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <NeumoInput
                  id="nome"
                  label="Nome da Transportadora"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Transportes Rápidos Ltda"
                  required
                />
              </div>
              
              <div>
                <NeumoInput
                  id="cnpj"
                  label="CNPJ"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orx-text-primary mb-2">
                  Tipo de Transporte <span className="text-orx-danger">*</span>
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2 focus-visible:shadow-neumo-sm"
                  required
                >
                  <option value="">Selecione...</option>
                  {TIPOS_TRANSPORTE.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <NeumoInput
                  id="telefone"
                  label="Telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>
              
              <div>
                <NeumoInput
                  id="email"
                  label="E-mail"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@transportadora.com.br"
                />
              </div>
              
              <div>
                <NeumoInput
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
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <h2 className="text-lg font-semibold text-orx-text-primary mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orx-primary" />
              Dados Operacionais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <NeumoInput
                  id="prazo_entrega_medio"
                  label="Prazo Médio Entrega (dias)"
                  type="number"
                  value={formData.prazo_entrega_medio || ''}
                  onChange={(e) => setFormData({ ...formData, prazo_entrega_medio: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 3"
                />
              </div>
              
              <div>
                <NeumoInput
                  id="custo_km"
                  label="Custo por KM (R$)"
                  type="number"
                  step="0.01"
                  value={formData.custo_km || ''}
                  onChange={(e) => setFormData({ ...formData, custo_km: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 1.50"
                />
              </div>
              
              <div>
                <NeumoInput
                  id="raio_atendimento"
                  label="Raio de Atendimento (km)"
                  type="number"
                  value={formData.raio_atendimento || ''}
                  onChange={(e) => setFormData({ ...formData, raio_atendimento: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 100"
                />
              </div>
              
              <div>
                <NeumoInput
                  id="horario_coleta"
                  label="Horário de Coleta"
                  value={formData.horario_coleta || ''}
                  onChange={(e) => setFormData({ ...formData, horario_coleta: e.target.value })}
                  placeholder="Ex: 08:00 - 18:00"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-orx-text-primary mb-2">
                Avaliação
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, avaliacao: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ${
                        (formData.avaliacao || 0) >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-orx-text-muted'
                      }`}
                    />
                  </button>
                ))}
                {formData.avaliacao && (
                  <span className="ml-2 text-sm text-orx-text-secondary">
                    {formData.avaliacao}/5
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Integração API */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <h2 className="text-lg font-semibold text-orx-text-primary mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-orx-primary" />
              Integração de API
            </h2>
            
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.possui_api}
                  onChange={(e) => setFormData({ ...formData, possui_api: e.target.checked })}
                  className="w-4 h-4 rounded border-orx-border-subtle"
                />
                <span className="text-sm text-orx-text-primary">
                  Esta transportadora possui API de rastreamento
                </span>
              </label>
            </div>
            
            {formData.possui_api && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <NeumoInput
                      id="api_url"
                      label="URL da API"
                      value={formData.api_url || ''}
                      onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                      placeholder="https://api.transportadora.com.br/v1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orx-text-primary mb-2">
                      Tipo de Autenticação
                    </label>
                    <select
                      value={formData.api_auth_type || ''}
                      onChange={(e) => setFormData({ ...formData, api_auth_type: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione...</option>
                      {TIPOS_AUTH.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orx-text-primary mb-2">
                      Token/Chave de API
                    </label>
                    <div className="relative">
                      <input
                        type={showApiToken ? 'text' : 'password'}
                        value={formData.api_token || ''}
                        onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 pr-10 text-orx-text-primary text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-orx-text-muted hover:text-orx-text-primary"
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
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <NeumoTextarea
              id="observacoes"
              label="Observações"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a transportadora..."
              rows={4}
            />
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3">
            <NeumoButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/cadastros')}
              disabled={loading}
            >
              Cancelar
            </NeumoButton>
            
            <NeumoButton
              type="submit"
              loading={loading}
              leftIcon={loading ? undefined : Truck}
            >
              {loading ? 'Salvando...' : 'Salvar Transportadora'}
            </NeumoButton>
          </div>
        </form>
      </div>
    </div>
  );
}
