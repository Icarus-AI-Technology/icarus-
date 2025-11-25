import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  Calculator,
  Package,
  Tag,
  DollarSign,
  Archive,
  QrCode,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/oraclusx-ds/Input';
import { Button } from '@/components/oraclusx-ds/Button';
import { Select } from '@/components/oraclusx-ds/Select';
import { NeumoTextarea } from '@/components/oraclusx-ds/NeumoTextarea';

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
  requer_refrigeracao: false,
};

const CATEGORIAS = [
  'Ortopedia',
  'Cardiologia',
  'Oftalmologia',
  'Neurologia',
  'Cirurgia Geral',
  'Odontologia',
  'Outros',
];

const CadastroProdutosOPME: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProdutoOPMEFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  // Calcular preço de venda automaticamente
  React.useEffect(() => {
    if (formData.preco_custo && formData.margem_lucro) {
      const precoVenda = formData.preco_custo * (1 + formData.margem_lucro / 100);
      setFormData((prev) => ({ ...prev, preco_venda: precoVenda }));
    }
  }, [formData.preco_custo, formData.margem_lucro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate('/cadastros');
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--orx-bg-app)]">
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
                Cadastro de Produtos OPME
              </h1>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
                Preencha os dados do produto para ortopedia, materiais especiais e medicamentos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Identificação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  variant="neumo"
                  id="codigo_interno"
                  label="Código Interno *"
                  value={formData.codigo_interno}
                  disabled
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="codigo_barras"
                  label="Código de Barras (EAN)"
                  value={formData.codigo_barras || ''}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  placeholder="7891234567890"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="codigo_anvisa"
                  label="Código ANVISA"
                  value={formData.codigo_anvisa || ''}
                  onChange={(e) => setFormData({ ...formData, codigo_anvisa: e.target.value })}
                  placeholder="80123456789"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="codigo_tuss"
                  label="Código TUSS"
                  value={formData.codigo_tuss || ''}
                  onChange={(e) => setFormData({ ...formData, codigo_tuss: e.target.value })}
                  placeholder="Digite para buscar..."
                />
              </div>

              <div className="lg:col-span-4">
                <NeumoTextarea
                  id="descricao"
                  label="Descrição Completa *"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  placeholder="Descrição detalhada do produto OPME..."
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Tag size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Classificação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Select
                  label="Categoria *"
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria: value ?? formData.categoria })
                  }
                  options={CATEGORIAS.map((cat) => ({ value: cat, label: cat }))}
                />
              </div>

              <div>
                <Select
                  label="Classe de Risco ANVISA"
                  value={formData.classe_risco || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      classe_risco: (value ?? formData.classe_risco) as ProdutoOPMEFormData['classe_risco'],
                    })
                  }
                  options={[
                    { value: 'I', label: 'Classe I (Baixo Risco)' },
                    { value: 'II', label: 'Classe II (Médio Risco)' },
                    { value: 'III', label: 'Classe III (Alto Risco)' },
                    { value: 'IV', label: 'Classe IV (Máximo Risco)' },
                  ]}
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="tipo_material"
                  label="Tipo de Material"
                  value={formData.tipo_material || ''}
                  onChange={(e) => setFormData({ ...formData, tipo_material: e.target.value })}
                  placeholder="Ex: Titânio, Aço Inox, Polietileno"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="fabricante"
                  label="Fabricante"
                  value={formData.fabricante || ''}
                  onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Precificação */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Precificação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  variant="neumo"
                  id="preco_custo"
                  label="Preço de Custo (R$) *"
                  type="number"
                  value={formData.preco_custo}
                  onChange={(e) =>
                    setFormData({ ...formData, preco_custo: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="margem_lucro"
                  label="Margem de Lucro (%) *"
                  type="number"
                  value={formData.margem_lucro}
                  onChange={(e) =>
                    setFormData({ ...formData, margem_lucro: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  max="1000"
                  step="0.01"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="preco_venda"
                  label="Preço de Venda (R$)"
                  type="number"
                  value={formData.preco_venda.toFixed(2)}
                  disabled
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="preco_minimo"
                  label="Preço Mínimo (R$)"
                  type="number"
                  value={formData.preco_minimo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, preco_minimo: parseFloat(e.target.value) })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-[var(--orx-bg-light)] border border-[var(--orx-border-subtle)]">
              <div className="flex items-start gap-3">
                <Calculator size={20} className="text-[var(--orx-info)] mt-[2px]" />
                <div>
                  <p className="text-[var(--orx-text-primary)] font-medium mb-1 text-[0.813rem]">
                    Preço de Venda calculado automaticamente: R$ {formData.preco_venda.toFixed(2)}
                  </p>
                  <p className="text-[0.75rem] text-[var(--orx-text-secondary)]">
                    Fórmula: Custo (R$ {formData.preco_custo.toFixed(2)}) × (1 + Margem (
                    {formData.margem_lucro}%))
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Archive size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Controle de Estoque
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Select
                  label="Unidade de Medida *"
                  value={formData.unidade_medida}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidade_medida: value ?? formData.unidade_medida })
                  }
                  options={[
                    { value: 'UN', label: 'Unidade' },
                    { value: 'CX', label: 'Caixa' },
                    { value: 'PC', label: 'Peça' },
                    { value: 'KIT', label: 'Kit' },
                    { value: 'PAR', label: 'Par' },
                  ]}
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="estoque_minimo"
                  label="Estoque Mínimo *"
                  type="number"
                  value={formData.estoque_minimo}
                  onChange={(e) =>
                    setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="estoque_maximo"
                  label="Estoque Máximo"
                  type="number"
                  value={formData.estoque_maximo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, estoque_maximo: parseInt(e.target.value) })
                  }
                  min="0"
                />
              </div>

              <div>
                <Input
                  variant="neumo"
                  id="ponto_pedido"
                  label="Ponto de Pedido"
                  type="number"
                  value={formData.ponto_pedido || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ponto_pedido: parseInt(e.target.value) })
                  }
                  min="0"
                  placeholder="Qtd para novo pedido"
                />
              </div>

              <div className="lg:col-span-4">
                <Input
                  variant="neumo"
                  id="localizacao_estoque"
                  label="Localização (Almoxarifado)"
                  value={formData.localizacao_estoque || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao_estoque: e.target.value })
                  }
                  placeholder="Ex: A01-P03-N02"
                />
              </div>
            </div>
          </div>

          {/* Rastreabilidade */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Rastreabilidade e Armazenamento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'rastreavel', label: 'Exige Rastreamento Individual' },
                { key: 'controla_lote', label: 'Controla Lote' },
                { key: 'controla_validade', label: 'Controla Validade' },
                { key: 'controla_numero_serie', label: 'Controla Número de Série' },
                { key: 'requer_refrigeracao', label: 'Requer Refrigeração' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof ProdutoOPMEFormData] as boolean}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--orx-border-subtle)] text-[var(--orx-primary)] focus:ring-[var(--orx-primary)]"
                  />
                  <span className="text-[0.813rem] text-[var(--orx-text-primary)]">{label}</span>
                </label>
              ))}
            </div>

            {formData.requer_refrigeracao && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Input
                    variant="neumo"
                    id="temperatura_minima"
                    label="Temperatura Mínima (°C)"
                    type="number"
                    value={formData.temperatura_minima || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, temperatura_minima: parseInt(e.target.value) })
                    }
                    placeholder="Ex: 2"
                  />
                </div>
                <div>
                  <Input
                    variant="neumo"
                    id="temperatura_maxima"
                    label="Temperatura Máxima (°C)"
                    type="number"
                    value={formData.temperatura_maxima || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, temperatura_maxima: parseInt(e.target.value) })
                    }
                    placeholder="Ex: 8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Observações
              </h2>
            </div>
            <NeumoTextarea
              id="observacoes"
              label="Observações"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={4}
              placeholder="Informações técnicas adicionais sobre o produto..."
            />
          </div>

          {/* Botões */}
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroProdutosOPME;
