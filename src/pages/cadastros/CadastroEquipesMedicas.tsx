/**
 * Cadastro de Equipes Médicas - ICARUS v5.0
 * Design System: OraclusX DS - Neumórfico 3D Premium
 * 
 * Formulário completo para cadastro de equipes médicas cirúrgicas
 * com validações, integrações e design neumórfico padronizado.
 */

import { useState } from 'react';
import { ArrowLeft, Users, Stethoscope, Plus, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NeumoInput, NeumoTextarea, NeumoButton } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface MembroEquipe {
  medico_id: string;
  medico_nome?: string;
  funcao: 'cirurgiao_principal' | 'cirurgiao_auxiliar' | 'anestesista' | 'instrumentador' | 'auxiliar_enfermagem' | '';
}

interface EquipeMedicaFormData {
  nome: string;
  medico_responsavel_id: string;
  especialidade?: string;
  hospital_id?: string;
  membros: MembroEquipe[];
  dias_atuacao?: string[];
  horarios_preferencia?: string;
  cirurgias_semana_media?: number;
  observacoes?: string;
}

const INITIAL_STATE: EquipeMedicaFormData = {
  nome: '',
  medico_responsavel_id: '',
  membros: [],
  dias_atuacao: []
};

const DIAS_SEMANA = [
  { id: 'segunda', label: 'Segunda' },
  { id: 'terca', label: 'Terça' },
  { id: 'quarta', label: 'Quarta' },
  { id: 'quinta', label: 'Quinta' },
  { id: 'sexta', label: 'Sexta' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' }
];

const FUNCOES = [
  { value: 'cirurgiao_principal', label: 'Cirurgião Principal' },
  { value: 'cirurgiao_auxiliar', label: 'Cirurgião Auxiliar' },
  { value: 'anestesista', label: 'Anestesista' },
  { value: 'instrumentador', label: 'Instrumentador' },
  { value: 'auxiliar_enfermagem', label: 'Auxiliar de Enfermagem' }
];

const ESPECIALIDADES = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'cirurgia_geral', label: 'Cirurgia Geral' },
  { value: 'vascular', label: 'Cirurgia Vascular' },
  { value: 'plastica', label: 'Cirurgia Plástica' }
];

export default function CadastroEquipesMedicas() {
  useDocumentTitle('Cadastro de Equipes Médicas');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EquipeMedicaFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const handleAddMembro = () => {
    setFormData({
      ...formData,
      membros: [...formData.membros, { medico_id: '', funcao: '' }]
    });
  };

  const handleRemoveMembro = (index: number) => {
    setFormData({
      ...formData,
      membros: formData.membros.filter((_, i) => i !== index)
    });
  };

  const handleUpdateMembro = (index: number, field: keyof MembroEquipe, value: string) => {
    const novosMembros = [...formData.membros];
    novosMembros[index] = { ...novosMembros[index], [field]: value };
    setFormData({ ...formData, membros: novosMembros });
  };

  const handleToggleDia = (dia: string) => {
    const dias = formData.dias_atuacao || [];
    if (dias.includes(dia)) {
      setFormData({
        ...formData,
        dias_atuacao: dias.filter(d => d !== dia)
      });
    } else {
      setFormData({
        ...formData,
        dias_atuacao: [...dias, dia]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome) {
      toast.error('Nome da equipe é obrigatório');
      return;
    }
    
    if (!formData.medico_responsavel_id) {
      toast.error('Médico responsável é obrigatório');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Equipe Médica salva:', formData);
      toast.success('Equipe médica cadastrada com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar equipe médica');
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
              <Users className="w-6 h-6 text-orx-primary" />
            </div>
            <div>
              <h1 className="orx-text-3xl orx-orx-font-bold text-orx-text-primary">
                Cadastro de Equipes Médicas
              </h1>
              <p className="text-orx-text-secondary mt-1">
                Configure equipes para cirurgias e procedimentos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <h2 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-6 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-orx-primary" />
              Identificação da Equipe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <NeumoInput
                  id="nome"
                  label="Nome da Equipe"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Equipe Cirurgia Cardíaca Dr. Silva"
                  required
                />
              </div>
              
              <div>
                <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                  Especialidade
                </label>
                <select
                  value={formData.especialidade || ''}
                  onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary orx-text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2 focus-visible:shadow-neumo-sm"
                >
                  <option value="">Selecione...</option>
                  {ESPECIALIDADES.map(esp => (
                    <option key={esp.value} value={esp.value}>{esp.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                  Médico Responsável <span className="text-orx-danger">*</span>
                </label>
                <select
                  value={formData.medico_responsavel_id}
                  onChange={(e) => setFormData({ ...formData, medico_responsavel_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary orx-text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2 focus-visible:shadow-neumo-sm"
                  required
                >
                  <option value="">Selecione o médico responsável...</option>
                  <option value="1">Dr. João Silva - CRM 12345/SP - Cardiologia</option>
                  <option value="2">Dra. Maria Santos - CRM 67890/SP - Ortopedia</option>
                  <option value="3">Dr. Pedro Costa - CRM 11223/SP - Neurologia</option>
                </select>
              </div>
              
              <div>
                <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                  Hospital Preferencial
                </label>
                <select
                  value={formData.hospital_id || ''}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary orx-text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2 focus-visible:shadow-neumo-sm"
                >
                  <option value="">Nenhum específico</option>
                  <option value="1">Hospital São Paulo</option>
                  <option value="2">Hospital Samaritano</option>
                  <option value="3">Hospital Sírio-Libanês</option>
                </select>
              </div>
            </div>
          </div>

          {/* Membros da Equipe */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <div className="flex items-center justify-between mb-6">
              <h2 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-orx-primary" />
                Membros da Equipe
              </h2>
              <NeumoButton
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={Plus}
                onClick={handleAddMembro}
              >
                Adicionar Membro
              </NeumoButton>
            </div>

            {formData.membros.length === 0 ? (
              <div className="text-center py-8 text-orx-text-muted">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum membro adicionado</p>
                <p className="orx-text-sm">Clique em "Adicionar Membro" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.membros.map((membro, index) => (
                  <div key={index} className="bg-orx-bg-app rounded-lg p-4 shadow-neumo-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                          Médico/Profissional
                        </label>
                        <select
                          value={membro.medico_id}
                          onChange={(e) => handleUpdateMembro(index, 'medico_id', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary orx-text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2"
                        >
                          <option value="">Selecione...</option>
                          <option value="1">Dr. João Silva - CRM 12345/SP</option>
                          <option value="2">Dra. Maria Santos - CRM 67890/SP</option>
                          <option value="3">Enf. Carlos Souza - COREN 98765/SP</option>
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-2">
                            Função
                          </label>
                          <select
                            value={membro.funcao}
                            onChange={(e) => handleUpdateMembro(index, 'funcao', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-orx-border-subtle bg-orx-bg-surface px-3 py-2 text-orx-text-primary orx-text-sm shadow-neumo-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orx-primary focus-visible:ring-offset-2"
                          >
                            <option value="">Selecione...</option>
                            {FUNCOES.map(funcao => (
                              <option key={funcao.value} value={funcao.value}>
                                {funcao.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <NeumoButton
                            type="button"
                            variant="danger"
                            size="icon"
                            onClick={() => handleRemoveMembro(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </NeumoButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <h2 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orx-primary" />
              Disponibilidade
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block orx-text-sm orx-orx-font-medium text-orx-text-primary mb-3">
                  Dias de Atuação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => handleToggleDia(dia.id)}
                      className={`
                        px-4 py-2 rounded-lg orx-text-sm orx-orx-font-medium transition-all duration-200
                        ${formData.dias_atuacao?.includes(dia.id)
                          ? 'bg-orx-primary text-white shadow-neumo'
                          : 'bg-orx-bg-app text-orx-text-secondary shadow-neumo-sm hover:shadow-neumo'
                        }
                      `}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeumoInput
                  id="horarios_preferencia"
                  label="Horários de Preferência"
                  value={formData.horarios_preferencia || ''}
                  onChange={(e) => setFormData({ ...formData, horarios_preferencia: e.target.value })}
                  placeholder="Ex: 08:00 - 12:00"
                />
                
                <NeumoInput
                  id="cirurgias_semana_media"
                  label="Cirurgias/Semana (Média)"
                  type="number"
                  value={formData.cirurgias_semana_media || ''}
                  onChange={(e) => setFormData({ ...formData, cirurgias_semana_media: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 5"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
            <NeumoTextarea
              id="observacoes"
              label="Observações"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a equipe..."
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
              leftIcon={loading ? undefined : Users}
            >
              {loading ? 'Salvando...' : 'Salvar Equipe'}
            </NeumoButton>
          </div>
        </form>
      </div>
    </div>
  );
}
