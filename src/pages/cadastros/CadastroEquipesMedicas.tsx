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
import { Input } from '@/components/oraclusx-ds/Input';
import { Button } from '@/components/oraclusx-ds/Button';
import { Select } from '@/components/oraclusx-ds/Select';
import { useDocumentTitle } from '@/hooks';

interface MembroEquipe {
  medico_id: string;
  medico_nome?: string;
  funcao:
    | 'cirurgiao_principal'
    | 'cirurgiao_auxiliar'
    | 'anestesista'
    | 'instrumentador'
    | 'auxiliar_enfermagem'
    | '';
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
  dias_atuacao: [],
};

const DIAS_SEMANA = [
  { id: 'segunda', label: 'Segunda' },
  { id: 'terca', label: 'Terça' },
  { id: 'quarta', label: 'Quarta' },
  { id: 'quinta', label: 'Quinta' },
  { id: 'sexta', label: 'Sexta' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
];

const FUNCOES = [
  { value: 'cirurgiao_principal', label: 'Cirurgião Principal' },
  { value: 'cirurgiao_auxiliar', label: 'Cirurgião Auxiliar' },
  { value: 'anestesista', label: 'Anestesista' },
  { value: 'instrumentador', label: 'Instrumentador' },
  { value: 'auxiliar_enfermagem', label: 'Auxiliar de Enfermagem' },
];

const ESPECIALIDADES = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'cirurgia_geral', label: 'Cirurgia Geral' },
  { value: 'vascular', label: 'Cirurgia Vascular' },
  { value: 'plastica', label: 'Cirurgia Plástica' },
];

export default function CadastroEquipesMedicas() {
  useDocumentTitle('Cadastro de Equipes Médicas');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EquipeMedicaFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const handleAddMembro = () => {
    setFormData({
      ...formData,
      membros: [...formData.membros, { medico_id: '', funcao: '' }],
    });
  };

  const handleRemoveMembro = (index: number) => {
    setFormData({
      ...formData,
      membros: formData.membros.filter((_, i) => i !== index),
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
        dias_atuacao: dias.filter((d) => d !== dia),
      });
    } else {
      setFormData({
        ...formData,
        dias_atuacao: [...dias, dia],
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/cadastros')}
              variant="ghost"
              className="p-3 rounded-lg flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)]">
                Cadastro de Equipes Médicas
              </h1>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
                Configure equipes para cirurgias e procedimentos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Stethoscope size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Identificação da Equipe
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Input
                  variant="neumo"
                  id="nome"
                  label="Nome da Equipe *"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Equipe Cirurgia Cardíaca Dr. Silva"
                />
              </div>

              <div>
                <Select
                  label="Especialidade"
                  value={formData.especialidade || ''}
                  onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                  options={ESPECIALIDADES}
                />
              </div>

              <div className="lg:col-span-2">
                <Select
                  label="Médico Responsável *"
                  value={formData.medico_responsavel_id}
                  onChange={(e) =>
                    setFormData({ ...formData, medico_responsavel_id: e.target.value })
                  }
                  options={[
                    { value: '1', label: 'Dr. João Silva - CRM 12345/SP - Cardiologia' },
                    { value: '2', label: 'Dra. Maria Santos - CRM 67890/SP - Ortopedia' },
                    { value: '3', label: 'Dr. Pedro Costa - CRM 11223/SP - Neurologia' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Hospital Preferencial"
                  value={formData.hospital_id || ''}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  options={[
                    { value: '1', label: 'Hospital São Paulo' },
                    { value: '2', label: 'Hospital Samaritano' },
                    { value: '3', label: 'Hospital Sírio-Libanês' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Membros da Equipe */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                  Membros da Equipe
                </h2>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddMembro}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Adicionar
              </Button>
            </div>

            {formData.membros.length === 0 ? (
              <div className="text-center py-8 text-[var(--orx-text-secondary)]">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum membro adicionado</p>
                <p className="text-[0.75rem]">Clique em "Adicionar" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.membros.map((membro, index) => (
                  <div
                    key={index}
                    className="bg-[var(--orx-bg-light)] rounded-lg p-4 shadow-[var(--orx-shadow-inner)]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Médico/Profissional"
                          value={membro.medico_id}
                          onChange={(e) => handleUpdateMembro(index, 'medico_id', e.target.value)}
                          options={[
                            { value: '1', label: 'Dr. João Silva - CRM 12345/SP' },
                            { value: '2', label: 'Dra. Maria Santos - CRM 67890/SP' },
                            { value: '3', label: 'Enf. Carlos Souza - COREN 98765/SP' },
                          ]}
                        />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Select
                            label="Função"
                            value={membro.funcao}
                            onChange={(e) => handleUpdateMembro(index, 'funcao', e.target.value)}
                            options={FUNCOES}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveMembro(index)}
                          className="p-3 text-[var(--orx-error)] hover:bg-[var(--orx-error)] hover:text-white"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Disponibilidade
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-3">
                  Dias de Atuação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => handleToggleDia(dia.id)}
                      className={`
                        px-4 py-2 rounded-lg text-[0.813rem] font-medium transition-all duration-200
                        ${
                          formData.dias_atuacao?.includes(dia.id)
                            ? 'bg-[var(--orx-primary)] text-white shadow-[var(--orx-shadow-card)]'
                            : 'bg-[var(--orx-bg-light)] text-[var(--orx-text-secondary)] shadow-[var(--orx-shadow-inner)] hover:shadow-[var(--orx-shadow-card)]'
                        }
                      `}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  variant="neumo"
                  id="horarios_preferencia"
                  label="Horários de Preferência"
                  value={formData.horarios_preferencia || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, horarios_preferencia: e.target.value })
                  }
                  placeholder="Ex: 08:00 - 12:00"
                />

                <Input
                  variant="neumo"
                  id="cirurgias_semana_media"
                  label="Cirurgias/Semana (Média)"
                  type="number"
                  value={formData.cirurgias_semana_media || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cirurgias_semana_media: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ex: 5"
                />
              </div>
            </div>
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
                placeholder="Informações adicionais sobre a equipe..."
                rows={4}
                className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all min-h-[100px]"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/cadastros')}
              disabled={loading}
              className="px-6 py-3"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6 py-3 flex items-center gap-2"
            >
              {loading ? 'Salvando...' : 'Salvar Equipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
