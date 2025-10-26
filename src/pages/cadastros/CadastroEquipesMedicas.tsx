import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Plus, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const FUNCOES = [
  { value: 'cirurgiao_principal', label: 'Cirurgião Principal' },
  { value: 'cirurgiao_auxiliar', label: 'Cirurgião Auxiliar' },
  { value: 'anestesista', label: 'Anestesista' },
  { value: 'instrumentador', label: 'Instrumentador' },
  { value: 'auxiliar_enfermagem', label: 'Auxiliar de Enfermagem' }
];

const CadastroEquipesMedicas: React.FC = () => {
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
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Equipe Médica salva:', formData);
      navigate('/cadastros');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/cadastros')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--orx-bg-light)',
            border: '1px solid var(--orx-border)',
            borderRadius: '0.5rem',
            color: 'var(--orx-text-primary)',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1 style={{ 
          fontSize: '0.813rem', 
          fontWeight: 'bold',
          color: 'var(--orx-text-primary)',
          marginBottom: '0.5rem'
        }}>
          Cadastro de Equipes Médicas
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Configure equipes para cirurgias e procedimentos
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Identificação */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Identificação da Equipe
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Nome da Equipe <span style={{ color: 'var(--orx-error)', fontSize: '0.813rem' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: Equipe de Ortopedia Dr. Silva"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Médico Responsável <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.medico_responsavel_id}
                onChange={(e) => setFormData({ ...formData, medico_responsavel_id: e.target.value })}
                required
                placeholder="Digite o nome ou CRM..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Especialidade Principal
              </label>
              <input
                type="text"
                value={formData.especialidade || ''}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                placeholder="Ex: Ortopedia"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Hospital Principal
              </label>
              <input
                type="text"
                value={formData.hospital_id || ''}
                onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                placeholder="Selecione o hospital..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Membros da Equipe */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Users size={24} />
            Membros da Equipe
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formData.membros.map((membro, index) => (
              <div 
                key={index}
                className="neumorphic-card"
                style={{ 
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'end',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                    Médico
                  </label>
                  <input
                    type="text"
                    value={membro.medico_nome || ''}
                    onChange={(e) => handleUpdateMembro(index, 'medico_nome', e.target.value)}
                    placeholder="Digite o nome ou CRM..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--orx-border)',
                      background: 'var(--orx-bg-light)',
                      color: 'var(--orx-text-primary)'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                    Função
                  </label>
                  <select
                    value={membro.funcao}
                    onChange={(e) => handleUpdateMembro(index, 'funcao', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--orx-border)',
                      background: 'var(--orx-bg-light)',
                      color: 'var(--orx-text-primary)'
                    }}
                  >
                    <option value="">Selecione...</option>
                    {FUNCOES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMembro(index)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--orx-error)',
                    background: 'transparent',
                    color: 'var(--orx-error)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddMembro}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '2px dashed var(--orx-border)',
                background: 'transparent',
                color: 'var(--orx-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--orx-indigo-500)';
                e.currentTarget.style.color = 'var(--orx-indigo-500)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--orx-border)';
                e.currentTarget.style.color = 'var(--orx-text-primary)';
              }}
            >
              <Plus size={20} />
              Adicionar Membro
            </button>
          </div>
        </div>

        {/* Configurações Operacionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Configurações Operacionais
          </h2>

          {/* Dias de Atuação */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--orx-text-primary)' }}>
              Dias de Atuação
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {DIAS_SEMANA.map((dia) => (
                <label
                  key={dia}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: `2px solid ${formData.dias_atuacao?.includes(dia) ? 'var(--orx-indigo-500)' : 'var(--orx-border)'}`,
                    background: formData.dias_atuacao?.includes(dia) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.dias_atuacao?.includes(dia) || false}
                    onChange={() => handleToggleDia(dia)}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--orx-text-primary)', fontSize: '0.813rem' }}>{dia}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Horários de Preferência
              </label>
              <input
                type="text"
                value={formData.horarios_preferencia || ''}
                onChange={(e) => setFormData({ ...formData, horarios_preferencia: e.target.value })}
                placeholder="Ex: Manhã (7h-12h)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Número Médio de Cirurgias/Semana
              </label>
              <input
                type="number"
                value={formData.cirurgias_semana_media || ''}
                onChange={(e) => setFormData({ ...formData, cirurgias_semana_media: parseInt(e.target.value) })}
                min="0"
                placeholder="Ex: 5"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Observações
          </h2>
          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
            placeholder="Informações adicionais sobre a equipe..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--orx-border)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/cadastros')}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--orx-border)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || formData.membros.length === 0}
            className="colored-button"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--orx-indigo-500)',
              color: 'white',
              cursor: (loading || formData.membros.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (loading || formData.membros.length === 0) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={20} />
                Cadastrar Equipe
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroEquipesMedicas;

