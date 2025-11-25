/**
 * Services Index - Exportação centralizada
 * Sistema: ICARUS v5.0
 */

// Estoque Services
export { ValidadeService } from './ValidadeService';
export type { ProdutoVencimento, AcaoVencimento, RelatorioVencimento } from './ValidadeService';

export { PontoReposicaoService } from './PontoReposicaoService';
export type {
  PontoReposicaoCalculo,
  ProdutoAbaixoPonto,
  SugestaoCompra,
  HistoricoConsumo,
} from './PontoReposicaoService';

export { EstoqueAI } from './EstoqueAI';
export type {
  PrevisaoDemanda,
  ClassificacaoABCXYZ,
  CalculoEOQ,
  Anomalia,
  OtimizacaoEstoque,
} from './EstoqueAI';

// Compliance Services
export { ComplianceAutomaticoAI } from './compliance';
export type { AlertaPreditivo } from './compliance';
