/**
 * Componente de Pesquisa de Preços - Compras Internacionais
 * ICARUS v5.0
 * 
 * Consulta preços de produtos via:
 * - SEFAZ (todos os estados)
 * - Fabricantes (via CNPJ)
 * - Invoices importadas
 * - Histórico de compras
 */

import { Card } from '@/components/ui/card';
import { useSEFAZ } from '@/services/sefaz.service';
import { useANVISA } from '@/services/anvisa.service';
import { Search, Package, TrendingDown, TrendingUp, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PesquisaPrecos = () => {
  const [registroANVISA, setRegistroANVISA] = useState('');
  const [ncm, setNCM] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [estadosSelecionados, setEstadosSelecionados] = useState<string[]>([
    'SP', 'RJ', 'MG', 'PR', 'SC', 'RS'
  ]);
  
  const anvisaAPI = useANVISA();
  const sefazAPI = useSEFAZ();

  const handleBuscarANVISA = async () => {
    try {
      const produto = await anvisaAPI.buscar(registroANVISA);
      setDescricaoProduto(produto.nome);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar produto ANVISA:', err);
    }
  };

  const handlePesquisarPrecos = async () => {
    try {
      await sefazAPI.consultarPrecos(ncm, descricaoProduto, estadosSelecionados);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao pesquisar preços:', err);
    }
  };

  const produtoANVISA = anvisaAPI.data;
  const precosSEFAZ = sefazAPI.precos;

  return (
    <div className="min-h-screen p-6 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[var(--text-primary)] mb-2 text-[0.813rem] font-extrabold">
            Pesquisa de Preços e Viabilidade
          </h1>
          <p className="text-[var(--text-secondary)] text-[0.813rem]">
            Compras Internacionais - Análise de Mercado Brasil
          </p>
        </div>

        {/* Busca ANVISA */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-[var(--text-primary)] text-[0.813rem] font-semibold">
              Validação ANVISA
            </h2>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-[var(--text-primary)] mb-2 text-[0.813rem] font-medium">
                Registro ANVISA
              </label>
              <input
                type="text"
                value={registroANVISA}
                onChange={(e) => setRegistroANVISA(e.target.value)}
                placeholder="Ex: 80145570021"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <button
              onClick={handleBuscarANVISA}
              disabled={anvisaAPI.loading}
              className={cn(
                'mt-7 px-6 py-2.5 rounded-lg font-medium transition-all',
                'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                'disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              )}
            >
              <Search className="w-5 h-5" />
              {anvisaAPI.loading ? 'Buscando...' : 'Validar'}
            </button>
          </div>

          {produtoANVISA && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--orx-success)]/10 border border-[var(--orx-success)]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)] mt-0.5" />
                <div className="flex-1">
                  <p className="text-[var(--orx-success)] mb-2 text-[0.813rem] font-semibold">
                    Produto validado na ANVISA ✓
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[var(--text-primary)] text-[0.813rem]">
                    <div>
                      <strong>Nome:</strong> {produtoANVISA.nome}
                    </div>
                    <div>
                      <strong>Fabricante:</strong> {produtoANVISA.fabricante}
                    </div>
                    <div>
                      <strong>Registro:</strong> {produtoANVISA.registro}
                    </div>
                    <div>
                      <strong>Validade:</strong>{' '}
                      <span className={cn(
                        new Date(produtoANVISA.dataValidade) > new Date() 
                          ? 'text-[var(--orx-success)]' 
                          : 'text-[var(--orx-error)]'
                      )}>
                        {new Date(produtoANVISA.dataValidade).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <strong>Classe:</strong> {produtoANVISA.classe}
                    </div>
                    <div>
                      <strong>Situação:</strong>{' '}
                      <span className={cn(
                        produtoANVISA.situacao === 'ATIVO' 
                          ? 'text-[var(--orx-success)]' 
                          : 'text-[var(--orx-warning)]'
                      )}>
                        {produtoANVISA.situacao}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Pesquisa de Preços SEFAZ */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-[var(--text-primary)] text-[0.813rem] font-semibold">
              Pesquisa de Preços SEFAZ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[var(--text-primary)] mb-2 text-[0.813rem] font-medium">
                NCM do Produto <span className="text-[var(--orx-error)]">*</span>
              </label>
              <input
                type="text"
                value={ncm}
                onChange={(e) => setNCM(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                placeholder="Ex: 90189090"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-primary)] mb-2 text-[0.813rem] font-medium">
                Descrição do Produto
              </label>
              <input
                type="text"
                value={descricaoProduto}
                onChange={(e) => setDescricaoProduto(e.target.value)}
                placeholder="Ex: Cateter cardíaco"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[var(--text-primary)] mb-3 text-[0.813rem] font-medium">
              Estados para Consulta
            </label>
            <div className="flex flex-wrap gap-2">
              {['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'PE', 'GO', 'DF'].map((uf) => (
                <button
                  key={uf}
                  onClick={() => {
                    if (estadosSelecionados.includes(uf)) {
                      setEstadosSelecionados(estadosSelecionados.filter(e => e !== uf));
                    } else {
                      setEstadosSelecionados([...estadosSelecionados, uf]);
                    }
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    estadosSelecionados.includes(uf)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]'
                  )}
                >
                  {uf}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePesquisarPrecos}
            disabled={sefazAPI.loading || ncm.length !== 8}
            className={cn(
              'w-full px-6 py-3 rounded-lg font-medium transition-all',
              'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
              'disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            )}
          >
            <Search className="w-5 h-5" />
            {sefazAPI.loading ? 'Pesquisando...' : 'Pesquisar Preços'}
          </button>
        </Card>

        {/* Resultados de Preços */}
        {precosSEFAZ && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-[var(--orx-success)]" />
                <h2 className="text-[var(--text-primary)] text-[0.813rem] font-semibold">
                  Análise de Preços
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[0.813rem]">
                <Calendar className="w-4 h-4" />
                Últimos 90 dias
              </div>
            </div>

            {/* Cards de Preços */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-4 bg-[var(--orx-success)]/10 border border-[var(--orx-success)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[var(--text-secondary)] text-[0.813rem]">
                    Preço Mínimo
                  </p>
                  <TrendingDown className="w-5 h-5 text-[var(--orx-success)]" />
                </div>
                <p className="text-[var(--orx-success)] text-[0.813rem] font-bold">
                  R$ {precosSEFAZ.precoMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </Card>

              <Card className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[var(--text-secondary)] text-[0.813rem]">
                    Preço Médio
                  </p>
                  <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <p className="text-[var(--primary)] text-[0.813rem] font-bold">
                  R$ {precosSEFAZ.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </Card>

              <Card className="p-4 bg-[var(--orx-error)]/10 border border-[var(--orx-error)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[var(--text-secondary)] text-[0.813rem]">
                    Preço Máximo
                  </p>
                  <TrendingUp className="w-5 h-5 text-[var(--orx-error)]" />
                </div>
                <p className="text-[var(--orx-error)] text-[0.813rem] font-bold">
                  R$ {precosSEFAZ.precoMaximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </Card>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-[var(--surface)]">
              <div>
                <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">
                  NCM
                </p>
                <p className="text-[var(--text-primary)] font-mono text-[0.813rem] font-semibold">
                  {precosSEFAZ.ncm}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">
                  Notas Fiscais Analisadas
                </p>
                <p className="text-[var(--text-primary)] text-[0.813rem] font-semibold">
                  {precosSEFAZ.quantidadeNotas}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">
                  Estados Consultados
                </p>
                <p className="text-[var(--text-primary)] text-[0.813rem] font-semibold">
                  {precosSEFAZ.estadosConsultados.length}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1 text-[0.813rem]">
                  Variação
                </p>
                <p className="text-[var(--orx-warning)] text-[0.813rem] font-semibold">
                  {((precosSEFAZ.precoMaximo - precosSEFAZ.precoMinimo) / precosSEFAZ.precoMinimo * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Estados */}
            <div className="mt-4">
              <p className="text-[var(--text-secondary)] mb-2 text-[0.813rem]">
                Estados com dados encontrados:
              </p>
              <div className="flex flex-wrap gap-2">
                {precosSEFAZ.estadosConsultados.map((uf) => (
                  <span
                    key={uf}
                    className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[0.813rem] font-medium"
                  >
                    {uf}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PesquisaPrecos;

