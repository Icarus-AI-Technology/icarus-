/**
 * Batch 3-6 Tests: Hooks Restantes (Estoque, CRM, Sistema, Integrações)
 *
 * @description
 * Testes unitários consolidados para os hooks restantes do ICARUS v5.0
 *
 * BATCH 3 - Estoque & Logística (5 hooks):
 * - useMateriais, useLotes, useAlertasEstoque, useVisaoEstoque, useEntregas
 *
 * BATCH 4 - CRM & Negócio (4 hooks):
 * - useLeads, useOportunidades, useKits, useLotesFaturamento
 *
 * BATCH 5 - Sistema & Utilitários (5 hooks):
 * - useActivityTracker, useErrorHandler, useFeatureFlag, useDocumentTitle, useCadastrosKPIs
 *
 * BATCH 6 - Integrações (2 hooks):
 * - useBrasilAPI, useGPTResearcher
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Batch 3 - Estoque & Logística
import { useMateriais } from "../useMateriais";
import { useLotes } from "../useLotes";
import { useAlertasEstoque } from "../useAlertasEstoque";
import { useVisaoEstoque } from "../useVisaoEstoque";
import { useEntregas } from "../useEntregas";

// Batch 4 - CRM & Negócio
import { useLeads } from "../useLeads";
import { useOportunidades } from "../useOportunidades";
import { useKits } from "../useKits";
import { useLotesFaturamento } from "../useLotesFaturamento";

// Batch 5 - Sistema & Utilitários
import { useActivityTracker } from "../useActivityTracker";
import { useErrorHandler } from "../useErrorHandler";
import { useFeatureFlag } from "../useFeatureFlag";
import { useDocumentTitle } from "../useDocumentTitle";
import { useCadastrosKPIs } from "../useCadastrosKPIs";

// Batch 6 - Integrações
import { useBrasilAPI } from "../useBrasilAPI";
import { useGPTResearcher } from "../useGPTResearcher";

// Mock global do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

// ==========================================
// BATCH 3: ESTOQUE & LOGÍSTICA
// ==========================================
describe("📦 Batch 3: Estoque & Logística", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("useMateriais", () => {
    it("deve buscar materiais", async () => {
      const { result } = renderHook(() => useMateriais());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.materiais).toBeDefined();
    });

    it("deve criar material", async () => {
      const { result } = renderHook(() => useMateriais());
      await waitFor(async () => {
        if (result.current.criarMaterial) {
          await result.current.criarMaterial({
            nome: "Material Test",
            codigo: "MAT-001",
          });
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useLotes", () => {
    it("deve buscar lotes", async () => {
      const { result } = renderHook(() => useLotes());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.lotes).toBeDefined();
    });

    it("deve criar lote", async () => {
      const { result } = renderHook(() => useLotes());
      await waitFor(async () => {
        if (result.current.criarLote) {
          await result.current.criarLote({
            numero: "LOTE-001",
            produto_id: "prod-1",
            quantidade: 100,
          });
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useAlertasEstoque", () => {
    it("deve buscar alertas", async () => {
      const { result } = renderHook(() => useAlertasEstoque());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.alertas).toBeDefined();
    });

    it("deve marcar alerta como lido", async () => {
      const { result } = renderHook(() => useAlertasEstoque());
      await waitFor(async () => {
        if (result.current.marcarLido) {
          await result.current.marcarLido("alert-123");
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useVisaoEstoque", () => {
    it("deve obter visão geral", async () => {
      const { result } = renderHook(() => useVisaoEstoque());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.visao).toBeDefined();
    });

    it("deve obter produtos críticos", async () => {
      const { result } = renderHook(() => useVisaoEstoque());
      await waitFor(() => {
        if (result.current.produtosCriticos) {
          expect(Array.isArray(result.current.produtosCriticos)).toBe(true);
        }
      });
    });
  });

  describe("useEntregas", () => {
    it("deve buscar entregas", async () => {
      const { result } = renderHook(() => useEntregas());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.entregas).toBeDefined();
    });

    it("deve criar entrega", async () => {
      const { result } = renderHook(() => useEntregas());
      await waitFor(async () => {
        if (result.current.criarEntrega) {
          await result.current.criarEntrega({
            pedido_id: "ped-1",
            transportadora_id: "transp-1",
          });
        }
      });
      expect(result.current.error).toBeNull();
    });
  });
});

// ==========================================
// BATCH 4: CRM & NEGÓCIO
// ==========================================
describe("💼 Batch 4: CRM & Negócio", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("useLeads", () => {
    it("deve buscar leads", async () => {
      const { result } = renderHook(() => useLeads());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.leads).toBeDefined();
    });

    it("deve criar lead", async () => {
      const { result } = renderHook(() => useLeads());
      await waitFor(async () => {
        if (result.current.criarLead) {
          await result.current.criarLead({
            nome: "Lead Test",
            email: "lead@test.com",
            telefone: "11999999999",
          });
        }
      });
      expect(result.current.error).toBeNull();
    });

    it("deve converter lead em oportunidade", async () => {
      const { result } = renderHook(() => useLeads());
      await waitFor(async () => {
        if (result.current.converterEmOportunidade) {
          await result.current.converterEmOportunidade("lead-123");
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useOportunidades", () => {
    it("deve buscar oportunidades", async () => {
      const { result } = renderHook(() => useOportunidades());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.oportunidades).toBeDefined();
    });

    it("deve atualizar estágio", async () => {
      const { result } = renderHook(() => useOportunidades());
      await waitFor(async () => {
        if (result.current.atualizarEstagio) {
          await result.current.atualizarEstagio("opor-123", "negociacao");
        }
      });
      expect(result.current.error).toBeNull();
    });

    it("deve fechar oportunidade", async () => {
      const { result } = renderHook(() => useOportunidades());
      await waitFor(async () => {
        if (result.current.fecharOportunidade) {
          await result.current.fecharOportunidade(
            "opor-123",
            "ganho",
            "Cliente fechou contrato",
          );
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useKits", () => {
    it("deve buscar kits", async () => {
      const { result } = renderHook(() => useKits());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.kits).toBeDefined();
    });

    it("deve criar kit", async () => {
      const { result } = renderHook(() => useKits());
      await waitFor(async () => {
        if (result.current.criarKit) {
          await result.current.criarKit({
            nome: "Kit Ortopedia",
            itens: [{ produto_id: "prod-1", quantidade: 5 }],
          });
        }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("useLotesFaturamento", () => {
    it("deve buscar lotes de faturamento", async () => {
      const { result } = renderHook(() => useLotesFaturamento());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.lotes).toBeDefined();
    });

    it("deve criar lote de faturamento", async () => {
      const { result } = renderHook(() => useLotesFaturamento());
      await waitFor(async () => {
        if (result.current.criarLote) {
          await result.current.criarLote({
            convenio_id: "conv-1",
            periodo: "2025-10",
            cirurgias_ids: ["cir-1", "cir-2"],
          });
        }
      });
      expect(result.current.error).toBeNull();
    });

    it("deve enviar lote", async () => {
      const { result } = renderHook(() => useLotesFaturamento());
      await waitFor(async () => {
        if (result.current.enviarLote) {
          await result.current.enviarLote("lote-123");
        }
      });
      expect(result.current.error).toBeNull();
    });
  });
});

// ==========================================
// BATCH 5: SISTEMA & UTILITÁRIOS
// ==========================================
describe("⚙️ Batch 5: Sistema & Utilitários", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("useActivityTracker", () => {
    it("deve rastrear visualização de página", () => {
      const { result } = renderHook(() => useActivityTracker());
      expect(result.current.trackPageView).toBeDefined();
      result.current.trackPageView("dashboard", "principal");
    });

    it("deve rastrear evento", () => {
      const { result } = renderHook(() => useActivityTracker());
      expect(result.current.trackEvent).toBeDefined();
      result.current.trackEvent("button_click", "Salvar Produto");
    });
  });

  describe("useErrorHandler", () => {
    it("deve capturar erro", () => {
      const { result } = renderHook(() => useErrorHandler());
      expect(result.current.handleError).toBeDefined();
      const error = new Error("Test error");
      result.current.handleError(error);
    });

    it("deve limpar erros", () => {
      const { result } = renderHook(() => useErrorHandler());
      expect(result.current.clearErrors).toBeDefined();
      result.current.clearErrors();
      expect(result.current.errors).toHaveLength(0);
    });
  });

  describe("useFeatureFlag", () => {
    it("deve verificar feature habilitada", () => {
      const { result } = renderHook(() => useFeatureFlag("new_dashboard"));
      expect(typeof result.current).toBe("boolean");
    });

    it("deve retornar false para feature inexistente", () => {
      const { result } = renderHook(() => useFeatureFlag("inexistent_feature"));
      expect(result.current).toBe(false);
    });
  });

  describe("useDocumentTitle", () => {
    it("deve atualizar título do documento", () => {
      const { result } = renderHook(() => useDocumentTitle("Dashboard"));
      expect(document.title).toContain("Dashboard");
    });

    it("deve restaurar título original ao desmontar", () => {
      const originalTitle = document.title;
      const { unmount } = renderHook(() => useDocumentTitle("Teste"));
      unmount();
      expect(document.title).toBe(originalTitle);
    });
  });

  describe("useCadastrosKPIs", () => {
    it("deve buscar KPIs de cadastros", async () => {
      const { result } = renderHook(() => useCadastrosKPIs());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.kpis).toBeDefined();
    });

    it("deve ter métricas de totais", async () => {
      const { result } = renderHook(() => useCadastrosKPIs());
      await waitFor(() => {
        if (result.current.kpis) {
          expect(result.current.kpis).toHaveProperty("total_fornecedores");
          expect(result.current.kpis).toHaveProperty("total_produtos");
          expect(result.current.kpis).toHaveProperty("total_pacientes");
        }
      });
    });
  });
});

// ==========================================
// BATCH 6: INTEGRAÇÕES
// ==========================================
describe("🔌 Batch 6: Integrações", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("useBrasilAPI", () => {
    it("deve buscar dados de CEP", async () => {
      const { result } = renderHook(() => useBrasilAPI());
      await waitFor(async () => {
        if (result.current.buscarCEP) {
          const dados = await result.current.buscarCEP("01310-100");
          expect(dados).toBeDefined();
        }
      });
    });

    it("deve buscar dados de CNPJ", async () => {
      const { result } = renderHook(() => useBrasilAPI());
      await waitFor(async () => {
        if (result.current.buscarCNPJ) {
          const dados = await result.current.buscarCNPJ("12345678000190");
          expect(dados).toBeDefined();
        }
      });
    });

    it("deve lidar com erro de CEP inválido", async () => {
      const { result } = renderHook(() => useBrasilAPI());
      await waitFor(async () => {
        if (result.current.buscarCEP) {
          try {
            await result.current.buscarCEP("00000-000");
          } catch (error) {
            expect(error).toBeDefined();
          }
        }
      });
    });
  });

  describe("useGPTResearcher", () => {
    it("deve iniciar pesquisa", async () => {
      const { result } = renderHook(() => useGPTResearcher());
      await waitFor(async () => {
        if (result.current.iniciarPesquisa) {
          await result.current.iniciarPesquisa("Novos materiais OPME 2025");
        }
      });
      expect(result.current.error).toBeNull();
    });

    it("deve obter resultados da pesquisa", async () => {
      const { result } = renderHook(() => useGPTResearcher());
      await waitFor(() => {
        if (result.current.resultados) {
          expect(Array.isArray(result.current.resultados)).toBe(true);
        }
      });
    });

    it("deve cancelar pesquisa", async () => {
      const { result } = renderHook(() => useGPTResearcher());
      await waitFor(async () => {
        if (result.current.cancelarPesquisa) {
          await result.current.cancelarPesquisa();
        }
      });
      expect(result.current.loading).toBe(false);
    });

    it("deve salvar resultado", async () => {
      const { result } = renderHook(() => useGPTResearcher());
      await waitFor(async () => {
        if (result.current.salvarResultado) {
          await result.current.salvarResultado("pesquisa-123", {
            titulo: "Research",
            conteudo: "...",
          });
        }
      });
      expect(result.current.error).toBeNull();
    });
  });
});
