// Export all hooks
export { useDocumentTitle } from "./useDocumentTitle";
export { useAuth } from "./useAuth";

// ✅ BACKEND INTEGRADO (16 hooks)
export { useMedicos } from "./useMedicos"; // ✅ CRUD + Realtime
export { useCirurgias } from "./useCirurgias"; // ✅ CRUD + Realtime
export { useHospitais } from "./useHospitais"; // ✅ CRUD
export { useLeads } from "./useLeads"; // ✅ CRUD + Realtime
export { useFaturas } from "./useFaturas"; // ✅ CRUD
export { useOportunidades } from "./useOportunidades"; // ✅ CRUD
export { useEstoque } from "./useEstoque"; // ✅ CRUD + Realtime + Movimentações
export { useProdutos } from "./useProdutos"; // ✅ CRUD + Busca
export { useFornecedores } from "./useFornecedores"; // ✅ CRUD
export { useConvenios } from "./useConvenios"; // ✅ CRUD
export { usePacientes } from "./usePacientes"; // ✅ CRUD + Busca
export { useTransportadoras } from "./useTransportadoras"; // ✅ CRUD
export { useKits } from "./useKits"; // ✅ CRUD + Busca
export { useLotes } from "./useLotes"; // ✅ CRUD + Busca + Bloqueio
export { useNotasFiscais } from "./useNotasFiscais"; // ✅ CRUD + SEFAZ
export { useEquipesMedicas } from "./useEquipesMedicas"; // ✅ CRUD + Busca

// Hooks sem backend (ainda)
export { useTransacoes } from "./useTransacoes";
export { useMateriais } from "./useMateriais";
export { usePedidos } from "./usePedidos";
export { useEntregas } from "./useEntregas";
export { useContratos } from "./useContratos";

// Novos hooks para integração completa
export { useContasReceber } from "./useContasReceber";
export { useContasPagar } from "./useContasPagar";
export { useCentroCustos } from "./useCentroCustos";
export { useFluxoCaixa } from "./useFluxoCaixa";
export { useConciliacaoBancaria } from "./useConciliacaoBancaria";
export { useLotesFaturamento } from "./useLotesFaturamento";
export { useGPTResearcher } from "./useGPTResearcher";
export type {
  GPTResearcherConfig,
  ResearchLog,
  ResearchResult,
} from "./useGPTResearcher";

// Hook Dashboard
export { useDashboardData } from "./useDashboardData";
export type { KPIData, MiniGraphData, DashboardData } from "./useDashboardData";

// Hook Consignação
export { useConsignacao } from "./useConsignacao";
export type {
  MaterialConsignado,
  ContratoConsignacao,
  MovimentacaoConsignacao,
  FaturamentoConsignacao,
  AlertaConsignacao,
  MetricasConsignacao,
} from "./useConsignacao";

// Hook Compliance
export { useCompliance } from "./useCompliance";
export type {
  ComplianceRequisito,
  AuditoriaInterna,
  NaoConformidade,
  AgenteIA,
  AlertaCompliance,
  TreinamentoCertificacao,
  MetricasCompliance,
} from "./useCompliance";
