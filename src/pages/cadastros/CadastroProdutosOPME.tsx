import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProdutoOPMEFormData {
  codigo_interno: string;
  codigo_barras?: string;
  codigo_anvisa?: string;
  codigo_tuss?: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  classe_risco?: 'I' | 'II' | 'III' | 'IV' | '';
  tipo_material?: string;
  fornecedor_id: string;
  fabricante?: string;
  pais_origem?: string;
  preco_custo: number;
  margem_lucro: number;
  preco_venda: number;
  preco_minimo?: number;
  unidade_medida: string;
  estoque_minimo: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  localizacao_estoque?: string;
  rastreavel: boolean;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_numero_serie: boolean;
  requer_refrigeracao: boolean;
  temperatura_minima?: number;
  temperatura_maxima?: number;
  observacoes?: string;
}

const INITIAL_STATE: ProdutoOPMEFormData = {
  codigo_interno: `OPME-${Date.now()}`,
  descricao: '',
  categoria: '',
  fornecedor_id: '',
  preco_custo: 0,
  margem_lucro: 0,
  preco_venda: 0,
  unidade_medida: 'UN',
  estoque_minimo: 0,
  rastreavel: false,
  controla_lote: false,
  controla_validade: false,
  controla_numero_serie: false,
  requer_refrigeracao: false
};

const CATEGORIAS = [
  'Ortopedia', 'Cardiologia', 'Oftalmologia', 'Neurologia', 
  'Cirurgia Geral', 'Odontologia', 'Outros'
];

const CadastroProdutosOPME: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProdutoOPMEFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  // Calcular preço de venda automaticamente
  React.useEffect(() => {
    if (formData.preco_custo && formData.margem_lucro) {
      const precoVenda = formData.preco_custo * (1 + formData.margem_lucro / 100);
      setFormData(prev => ({ ...prev, preco_venda: precoVenda }));
    }
  }, [formData.preco_custo, formData.margem_lucro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Produto OPME salvo:', formData);
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
          Cadastro de Produtos OPME
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Preencha os dados do produto para ortopedia, materiais especiais e medicamentos
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
            Identificação
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Código Interno <span style={{ color: 'var(--orx-error)', fontSize: '0.813rem' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.codigo_interno}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-secondary)',
                  opacity: 0.7
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Código de Barras (EAN)
              </label>
              <input
                type="text"
                value={formData.codigo_barras || ''}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                placeholder="7891234567890"
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
                Código ANVISA
              </label>
              <input
                type="text"
                value={formData.codigo_anvisa || ''}
                onChange={(e) => setFormData({ ...formData, codigo_anvisa: e.target.value })}
                placeholder="80123456789"
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
                Código TUSS
              </label>
              <input
                type="text"
                value={formData.codigo_tuss || ''}
                onChange={(e) => setFormData({ ...formData, codigo_tuss: e.target.value })}
                placeholder="Digite para buscar..."
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Descrição Completa <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
                rows={3}
                placeholder="Descrição detalhada do produto OPME..."
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
          </div>
        </div>

        {/* Classificação */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Classificação
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Categoria <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
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
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Classe de Risco ANVISA
              </label>
              <select
                value={formData.classe_risco || ''}
                onChange={(e) => setFormData({ ...formData, classe_risco: e.target.value as ProdutoOPMEFormData['classe_risco'] })}
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
                <option value="I">Classe I (Baixo Risco)</option>
                <option value="II">Classe II (Médio Risco)</option>
                <option value="III">Classe III (Alto Risco)</option>
                <option value="IV">Classe IV (Máximo Risco)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Tipo de Material
              </label>
              <input
                type="text"
                value={formData.tipo_material || ''}
                onChange={(e) => setFormData({ ...formData, tipo_material: e.target.value })}
                placeholder="Ex: Titânio, Aço Inox, Polietileno"
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
                Fabricante
              </label>
              <input
                type="text"
                value={formData.fabricante || ''}
                onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
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

        {/* Precificação */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Precificação
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Preço de Custo (R$) <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.preco_custo}
                onChange={(e) => setFormData({ ...formData, preco_custo: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
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
                Margem de Lucro (%) <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.margem_lucro}
                onChange={(e) => setFormData({ ...formData, margem_lucro: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                max="1000"
                step="0.01"
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
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                value={formData.preco_venda.toFixed(2)}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-secondary)',
                  opacity: 0.7
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Preço Mínimo (R$)
              </label>
              <input
                type="number"
                value={formData.preco_minimo || ''}
                onChange={(e) => setFormData({ ...formData, preco_minimo: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
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

          <div className="neumorphic-card" style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            background: 'rgba(99, 102, 241, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Calculator size={20} style={{ color: 'var(--orx-info)', marginTop: '2px' }} />
              <div>
                <p style={{ color: 'var(--orx-text-primary)', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Preço de Venda calculado automaticamente: R$ {formData.preco_venda.toFixed(2)}
                </p>
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                  Fórmula: Custo (R$ {formData.preco_custo.toFixed(2)}) × (1 + Margem ({formData.margem_lucro}%))
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estoque */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Controle de Estoque
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Unidade de Medida <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                value={formData.unidade_medida}
                onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              >
                <option value="UN">Unidade</option>
                <option value="CX">Caixa</option>
                <option value="PC">Peça</option>
                <option value="KIT">Kit</option>
                <option value="PAR">Par</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Estoque Mínimo <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 0 })}
                required
                min="0"
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
                Estoque Máximo
              </label>
              <input
                type="number"
                value={formData.estoque_maximo || ''}
                onChange={(e) => setFormData({ ...formData, estoque_maximo: parseInt(e.target.value) })}
                min="0"
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
                Ponto de Pedido
              </label>
              <input
                type="number"
                value={formData.ponto_pedido || ''}
                onChange={(e) => setFormData({ ...formData, ponto_pedido: parseInt(e.target.value) })}
                min="0"
                placeholder="Qtd para novo pedido"
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
                Localização (Almoxarifado)
              </label>
              <input
                type="text"
                value={formData.localizacao_estoque || ''}
                onChange={(e) => setFormData({ ...formData, localizacao_estoque: e.target.value })}
                placeholder="Ex: A01-P03-N02"
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

        {/* Rastreabilidade */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Rastreabilidade e Armazenamento
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[
              { key: 'rastreavel', label: 'Exige Rastreamento Individual' },
              { key: 'controla_lote', label: 'Controla Lote' },
              { key: 'controla_validade', label: 'Controla Validade' },
              { key: 'controla_numero_serie', label: 'Controla Número de Série' },
              { key: 'requer_refrigeracao', label: 'Requer Refrigeração' }
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData[key as keyof ProdutoOPMEFormData] as boolean}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--orx-text-primary)' }}>{label}</span>
              </label>
            ))}
          </div>

          {formData.requer_refrigeracao && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                  Temperatura Mínima (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperatura_minima || ''}
                  onChange={(e) => setFormData({ ...formData, temperatura_minima: parseInt(e.target.value) })}
                  placeholder="Ex: 2"
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
                  Temperatura Máxima (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperatura_maxima || ''}
                  onChange={(e) => setFormData({ ...formData, temperatura_maxima: parseInt(e.target.value) })}
                  placeholder="Ex: 8"
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
          )}
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
            rows={4}
            placeholder="Informações técnicas adicionais sobre o produto..."
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
            disabled={loading}
            className="colored-button"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--orx-indigo-500)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
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
                Cadastrar Produto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroProdutosOPME;

