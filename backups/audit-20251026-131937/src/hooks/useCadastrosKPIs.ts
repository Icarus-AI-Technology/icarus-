/**
 * Hook para KPIs de Cadastros - ICARUS v5.0
 *
 * Responsável por:
 * - Buscar e processar KPIs do dashboard
 * - Calcular estatísticas agregadas
 * - Gerenciar loading states
 * - Cache de dados
 *
 * @version 5.0.0
 */

import { useState, useEffect, useCallback } from "react";
import { cadastrosService } from "@/services/CadastrosService";
import type { DuplicateMatch } from "@/services/DuplicateDetectionService";

// ========================================
// INTERFACES
// ========================================

export interface CadastrosKPIs {
  medicosAtivos: number;
  hospitaisAtivos: number;
  totalPacientes: number;
  conveniosAtivos: number;
  fornecedoresAtivos: number;
  produtosOPME: number;
  cadastrosPendentes: number;
  cadastrosAtualizados30dias: number;

  // Dados para gráficos
  evolucaoCadastros: EvolucaoCadastro[];
  topMedicos: TopMedico[];
  topHospitais: TopHospital[];
  produtosPorCategoria: ProdutoCategoria[];
}

export interface EvolucaoCadastro {
  mes: string;
  medicos: number;
  hospitais: number;
  pacientes: number;
  fornecedores: number;
  produtos: number;
}

export interface TopMedico {
  id: string;
  nome: string;
  especialidade: string;
  cirurgias: number;
}

export interface TopHospital {
  id: string;
  nome: string;
  faturamento: number;
  cirurgias: number;
}

export interface ProdutoCategoria {
  categoria: string;
  quantidade: number;
  valor: number;
}

export interface AlertaCadastro {
  id: string;
  tipo: "warning" | "error" | "info";
  titulo: string;
  descricao: string;
  timestamp: Date;
}

// ========================================
// HOOK
// ========================================

export const useCadastrosKPIs = () => {
  const [kpis, setKpis] = useState<CadastrosKPIs>({
    medicosAtivos: 0,
    hospitaisAtivos: 0,
    totalPacientes: 0,
    conveniosAtivos: 0,
    fornecedoresAtivos: 0,
    produtosOPME: 0,
    cadastrosPendentes: 0,
    cadastrosAtualizados30dias: 0,
    evolucaoCadastros: [],
    topMedicos: [],
    topHospitais: [],
    produtosPorCategoria: [],
  });

  const [alertas, setAlertas] = useState<AlertaCadastro[]>([]);
  const [duplicatas, setDuplicatas] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const [medicos, hospitais, pacientes, convenios, fornecedores, produtos] =
        await Promise.all([
          cadastrosService.listar("medico", { filtros: { ativo: true } }),
          cadastrosService.listar("hospital", { filtros: { ativo: true } }),
          cadastrosService.listar("paciente", { filtros: { ativo: true } }),
          cadastrosService.listar("convenio", { filtros: { ativo: true } }),
          cadastrosService.listar("fornecedor", { filtros: { ativo: true } }),
          cadastrosService.listar("produto_opme", { filtros: { ativo: true } }),
        ]);

      // Calcular KPIs básicos
      setKpis({
        medicosAtivos: medicos.count,
        hospitaisAtivos: hospitais.count,
        totalPacientes: pacientes.count,
        conveniosAtivos: convenios.count,
        fornecedoresAtivos: fornecedores.count,
        produtosOPME: produtos.count,
        cadastrosPendentes: 0, // TODO: Implementar lógica de pendentes
        cadastrosAtualizados30dias: 0, // TODO: Implementar cálculo

        // Mock de dados para gráficos (TODO: Implementar queries reais)
        evolucaoCadastros: generateMockEvolucao(),
        topMedicos: generateMockTopMedicos(),
        topHospitais: generateMockTopHospitais(),
        produtosPorCategoria: generateMockProdutosCategorias(),
      });

      // Gerar alertas
      const alertasGerados = await generateAlertas({
        medicos: medicos.count,
        hospitais: hospitais.count,
        pacientes: pacientes.count,
        produtos: produtos.count,
      });
      setAlertas(alertasGerados);

      // Buscar duplicatas recentes (últimas 10)
      // TODO: Implementar query real de duplicatas detectadas
      setDuplicatas([]);
    } catch (error) {
      console.error("Erro ao carregar KPIs:", error as Error);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKPIs();
  }, [loadKPIs]);

  const refresh = () => {
    loadKPIs();
  };

  return {
    kpis,
    alertas,
    duplicatas,
    loading,
    error,
    refresh,
  };
};

// ========================================
// FUNÇÕES AUXILIARES (MOCK DATA)
// ========================================

function generateMockEvolucao(): EvolucaoCadastro[] {
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return meses.map((mes) => ({
    mes,
    medicos: Math.floor(Math.random() * 20) + 10,
    hospitais: Math.floor(Math.random() * 5) + 2,
    pacientes: Math.floor(Math.random() * 50) + 30,
    fornecedores: Math.floor(Math.random() * 10) + 5,
    produtos: Math.floor(Math.random() * 30) + 15,
  }));
}

function generateMockTopMedicos(): TopMedico[] {
  const nomes = [
    "Dr. Carlos Silva",
    "Dra. Ana Santos",
    "Dr. João Oliveira",
    "Dra. Maria Costa",
    "Dr. Pedro Alves",
    "Dra. Julia Ferreira",
    "Dr. Roberto Lima",
    "Dra. Fernanda Rocha",
    "Dr. Ricardo Mendes",
    "Dra. Patricia Gomes",
  ];

  const especialidades = [
    "Ortopedia",
    "Cardiologia",
    "Neurologia",
    "Cirurgia Geral",
    "Traumatologia",
  ];

  return nomes.map((nome, idx) => ({
    id: `medico-${idx}`,
    nome,
    especialidade: especialidades[idx % especialidades.length],
    cirurgias: Math.floor(Math.random() * 50) + 20,
  }));
}

function generateMockTopHospitais(): TopHospital[] {
  const hospitais = [
    "Hospital São Lucas",
    "Hospital Santa Maria",
    "Clínica São José",
    "Hospital Central",
    "Hospital Regional",
    "Clínica Médica Avançada",
    "Hospital Universitário",
    "Hospital das Clínicas",
    "Hospital Geral",
    "Hospital Metropolitano",
  ];

  return hospitais.map((nome, idx) => ({
    id: `hospital-${idx}`,
    nome,
    faturamento: Math.floor(Math.random() * 500000) + 100000,
    cirurgias: Math.floor(Math.random() * 100) + 30,
  }));
}

function generateMockProdutosCategorias(): ProdutoCategoria[] {
  const categorias = [
    { categoria: "Ortopedia", cor: "var(--orx-primary)" },
    { categoria: "Cardiologia", cor: "var(--orx-pink-500)" },
    { categoria: "Neurologia", cor: "var(--orx-purple-500)" },
    { categoria: "Oftalmologia", cor: "var(--orx-teal-500)" },
    { categoria: "Cirurgia Geral", cor: "var(--orx-warning)" },
    { categoria: "Outros", cor: "var(--orx-gray-500)" },
  ];

  return categorias.map(({ categoria }) => ({
    categoria,
    quantidade: Math.floor(Math.random() * 100) + 20,
    valor: Math.floor(Math.random() * 200000) + 50000,
  }));
}

async function generateAlertas(stats: {
  medicos: number;
  hospitais: number;
  pacientes: number;
  produtos: number;
}): Promise<AlertaCadastro[]> {
  const alertas: AlertaCadastro[] = [];

  // Alerta: Poucos médicos cadastrados
  if (stats.medicos < 10) {
    alertas.push({
      id: "alerta-medicos",
      tipo: "warning",
      titulo: "Poucos médicos cadastrados",
      descricao: `Apenas ${stats.medicos} médico(s) cadastrado(s). Recomenda-se cadastrar mais médicos para melhor operação.`,
      timestamp: new Date(),
    });
  }

  // Alerta: Produtos com estoque baixo (TODO: implementar query real)
  alertas.push({
    id: "alerta-estoque",
    tipo: "warning",
    titulo: "Produtos com estoque baixo",
    descricao: "15 produtos OPME estão abaixo do estoque mínimo.",
    timestamp: new Date(),
  });

  // Alerta: Cadastros incompletos (TODO: implementar query real)
  alertas.push({
    id: "alerta-incompletos",
    tipo: "info",
    titulo: "Cadastros incompletos",
    descricao: "8 cadastros estão com dados incompletos. Clique para revisar.",
    timestamp: new Date(),
  });

  return alertas;
}

// ========================================
// HOOK PARA ALERTAS
// ========================================

export const useAlertasCadastros = () => {
  const [alertas, setAlertas] = useState<AlertaCadastro[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlertas = useCallback(async () => {
    try {
      setLoading(true);

      // TODO: Implementar query real de alertas
      const mockAlertas = await generateAlertas({
        medicos: 0,
        hospitais: 0,
        pacientes: 0,
        produtos: 0,
      });

      setAlertas(mockAlertas);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas]);

  const dismissAlerta = (id: string) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    alertas,
    loading,
    dismissAlerta,
    refresh: loadAlertas,
  };
};

// ========================================
// HOOK PARA DUPLICATAS DETECTADAS
// ========================================

export const useDuplicatasDetectadas = () => {
  const [duplicatas, setDuplicatas] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDuplicatas = useCallback(async () => {
    try {
      setLoading(true);

      // TODO: Implementar query real de duplicatas armazenadas
      // Por ora, retorna array vazio
      setDuplicatas([]);
    } catch (error) {
      console.error("Erro ao carregar duplicatas:", error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDuplicatas();
  }, [loadDuplicatas]);

  const ignoreDuplicata = (id: string) => {
    setDuplicatas((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    duplicatas,
    loading,
    ignoreDuplicata,
    refresh: loadDuplicatas,
  };
};
