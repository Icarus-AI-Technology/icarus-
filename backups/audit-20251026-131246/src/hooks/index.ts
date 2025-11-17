// Export all hooks
export { useDocumentTitle } from "./useDocumentTitle";
export { useAuth } from "./useAuth";
export { useMedicos } from "./useMedicos";
export { useCirurgias } from "./useCirurgias";
export { useHospitais } from "./useHospitais";
export { useLeads } from "./useLeads";
export { useTransacoes } from "./useTransacoes";
export { useMateriais } from "./useMateriais";
export { usePedidos } from "./usePedidos";
export { useFaturas } from "./useFaturas";
export { useEntregas } from "./useEntregas";
export { useContratos } from "./useContratos";
export { useOportunidades } from "./useOportunidades";

// Novos hooks para integração completa
export { useContasReceber } from "./useContasReceber";
export { useContasPagar } from "./useContasPagar";
export { useCentroCustos } from "./useCentroCustos";
export { useFluxoCaixa } from "./useFluxoCaixa";
export { useConciliacaoBancaria } from "./useConciliacaoBancaria";
export { useLotesFaturamento } from "./useLotesFaturamento";
export { useConvenios } from "./useConvenios";
export { useFornecedores } from "./useFornecedores";
export { useProdutos } from "./useProdutos";
export { useKits } from "./useKits";
export { useLotes } from "./useLotes";

// Hook GPT Researcher
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
