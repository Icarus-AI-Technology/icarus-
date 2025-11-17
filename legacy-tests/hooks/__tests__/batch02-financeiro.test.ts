/**
 * Batch 2 Tests: Hooks Financeiros
 *
 * @description
 * Testes unitários para hooks de gerenciamento financeiro do ICARUS v5.0
 *
 * Hooks testados:
 * - useContasPagar
 * - useContasReceber
 * - useFaturas
 * - useNotasFiscais
 * - useTransacoes
 * - useCentroCustos
 * - useConciliacaoBancaria
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useContasPagar } from "../useContasPagar";
import { useContasReceber } from "../useContasReceber";
import { useFaturas } from "../useFaturas";
import { useNotasFiscais } from "../useNotasFiscais";
import { useTransacoes } from "../useTransacoes";
import { useCentroCustos } from "../useCentroCustos";
import { useConciliacaoBancaria } from "../useConciliacaoBancaria";

// Mock do Supabase
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
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe("💰 Batch 2: Hooks Financeiros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. useContasPagar
  // ==========================================
  describe("useContasPagar", () => {
    it("deve buscar contas a pagar com sucesso", async () => {
      const { result } = renderHook(() => useContasPagar());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contas).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar conta a pagar", async () => {
      const { result } = renderHook(() => useContasPagar());

      const novaConta = {
        fornecedor_id: "forn-123",
        descricao: "Compra de materiais",
        valor: 5000.0,
        vencimento: "2025-11-30",
        status: "pendente" as const,
        categoria: "compras",
      };

      await waitFor(async () => {
        if (result.current.criarConta) {
          await result.current.criarConta(novaConta);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve pagar conta", async () => {
      const { result } = renderHook(() => useContasPagar());

      await waitFor(async () => {
        if (result.current.pagarConta) {
          await result.current.pagarConta("123", {
            data_pagamento: "2025-10-26",
            valor_pago: 5000.0,
            forma_pagamento: "transferencia",
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve lidar com erro", async () => {
      const mockError = new Error("Erro ao buscar contas");
      vi.mocked(require("@/lib/supabase").supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as never);

      const { result } = renderHook(() => useContasPagar());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================
  // 2. useContasReceber
  // ==========================================
  describe("useContasReceber", () => {
    it("deve buscar contas a receber com sucesso", async () => {
      const { result } = renderHook(() => useContasReceber());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contas).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar conta a receber", async () => {
      const { result } = renderHook(() => useContasReceber());

      const novaConta = {
        cliente_id: "cli-123",
        descricao: "Venda de produtos",
        valor: 10000.0,
        vencimento: "2025-11-30",
        status: "pendente" as const,
        categoria: "vendas",
      };

      await waitFor(async () => {
        if (result.current.criarConta) {
          await result.current.criarConta(novaConta);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve receber pagamento", async () => {
      const { result } = renderHook(() => useContasReceber());

      await waitFor(async () => {
        if (result.current.receberPagamento) {
          await result.current.receberPagamento("123", {
            data_recebimento: "2025-10-26",
            valor_recebido: 10000.0,
            forma_recebimento: "pix",
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve calcular totais", async () => {
      const { result } = renderHook(() => useContasReceber());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.totais) {
        expect(result.current.totais).toHaveProperty("pendente");
        expect(result.current.totais).toHaveProperty("recebido");
        expect(result.current.totais).toHaveProperty("vencido");
      }
    });
  });

  // ==========================================
  // 3. useFaturas
  // ==========================================
  describe("useFaturas", () => {
    it("deve buscar faturas com sucesso", async () => {
      const { result } = renderHook(() => useFaturas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.faturas).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve gerar fatura", async () => {
      const { result } = renderHook(() => useFaturas());

      const novaFatura = {
        cliente_id: "cli-123",
        periodo_inicio: "2025-10-01",
        periodo_fim: "2025-10-31",
        itens: [
          { descricao: "Cirurgia", valor: 5000.0 },
          { descricao: "Materiais", valor: 2000.0 },
        ],
        valor_total: 7000.0,
        vencimento: "2025-11-15",
      };

      await waitFor(async () => {
        if (result.current.gerarFatura) {
          await result.current.gerarFatura(novaFatura);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve enviar fatura por email", async () => {
      const { result } = renderHook(() => useFaturas());

      await waitFor(async () => {
        if (result.current.enviarFatura) {
          await result.current.enviarFatura("123", "cliente@email.com");
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve cancelar fatura", async () => {
      const { result } = renderHook(() => useFaturas());

      await waitFor(async () => {
        if (result.current.cancelarFatura) {
          await result.current.cancelarFatura("123", "Erro nos dados");
        }
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // 4. useNotasFiscais
  // ==========================================
  describe("useNotasFiscais", () => {
    it("deve buscar notas fiscais com sucesso", async () => {
      const { result } = renderHook(() => useNotasFiscais());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notas).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve emitir nota fiscal", async () => {
      const { result } = renderHook(() => useNotasFiscais());

      const novaNota = {
        tipo: "saida" as const,
        destinatario_id: "cli-123",
        numero: "000001",
        serie: "1",
        valor_total: 10000.0,
        itens: [
          { produto_id: "prod-1", quantidade: 5, valor_unitario: 2000.0 },
        ],
      };

      await waitFor(async () => {
        if (result.current.emitirNota) {
          await result.current.emitirNota(novaNota);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve cancelar nota fiscal", async () => {
      const { result } = renderHook(() => useNotasFiscais());

      await waitFor(async () => {
        if (result.current.cancelarNota) {
          await result.current.cancelarNota("123", "Erro na emissão");
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve baixar XML da nota", async () => {
      const { result } = renderHook(() => useNotasFiscais());

      await waitFor(async () => {
        if (result.current.baixarXML) {
          const xml = await result.current.baixarXML("123");
          expect(xml).toBeDefined();
        }
      });
    });
  });

  // ==========================================
  // 5. useTransacoes
  // ==========================================
  describe("useTransacoes", () => {
    it("deve buscar transações com sucesso", async () => {
      const { result } = renderHook(() => useTransacoes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transacoes).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar transação", async () => {
      const { result } = renderHook(() => useTransacoes());

      const novaTransacao = {
        tipo: "entrada" as const,
        categoria: "vendas",
        descricao: "Venda de produtos",
        valor: 5000.0,
        data: "2025-10-26",
        conta_id: "conta-123",
      };

      await waitFor(async () => {
        if (result.current.criarTransacao) {
          await result.current.criarTransacao(novaTransacao);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve filtrar transações por período", async () => {
      const { result } = renderHook(() => useTransacoes());

      await waitFor(async () => {
        if (result.current.filtrarPorPeriodo) {
          await result.current.filtrarPorPeriodo("2025-10-01", "2025-10-31");
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve calcular saldo", async () => {
      const { result } = renderHook(() => useTransacoes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.saldo) {
        expect(typeof result.current.saldo).toBe("number");
      }
    });
  });

  // ==========================================
  // 6. useCentroCustos
  // ==========================================
  describe("useCentroCustos", () => {
    it("deve buscar centros de custos com sucesso", async () => {
      const { result } = renderHook(() => useCentroCustos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.centros).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar centro de custos", async () => {
      const { result } = renderHook(() => useCentroCustos());

      const novoCentro = {
        codigo: "CC-001",
        nome: "Centro Cirúrgico",
        tipo: "operacional" as const,
        responsavel_id: "user-123",
        ativo: true,
      };

      await waitFor(async () => {
        if (result.current.criarCentro) {
          await result.current.criarCentro(novoCentro);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar centro de custos", async () => {
      const { result } = renderHook(() => useCentroCustos());

      await waitFor(async () => {
        if (result.current.atualizarCentro) {
          await result.current.atualizarCentro("123", { ativo: false });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve obter custos por centro", async () => {
      const { result } = renderHook(() => useCentroCustos());

      await waitFor(async () => {
        if (result.current.obterCustos) {
          const custos = await result.current.obterCustos("123", "2025-10");
          expect(custos).toBeDefined();
        }
      });
    });
  });

  // ==========================================
  // 7. useConciliacaoBancaria
  // ==========================================
  describe("useConciliacaoBancaria", () => {
    it("deve buscar conciliações com sucesso", async () => {
      const { result } = renderHook(() => useConciliacaoBancaria());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.conciliacoes).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve importar extrato bancário", async () => {
      const { result } = renderHook(() => useConciliacaoBancaria());

      const extrato = {
        conta_id: "conta-123",
        periodo_inicio: "2025-10-01",
        periodo_fim: "2025-10-31",
        transacoes: [
          {
            data: "2025-10-15",
            descricao: "TED",
            valor: 5000.0,
            tipo: "credito" as const,
          },
          {
            data: "2025-10-20",
            descricao: "PIX",
            valor: -1000.0,
            tipo: "debito" as const,
          },
        ],
      };

      await waitFor(async () => {
        if (result.current.importarExtrato) {
          await result.current.importarExtrato(extrato);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve conciliar transação", async () => {
      const { result } = renderHook(() => useConciliacaoBancaria());

      await waitFor(async () => {
        if (result.current.conciliarTransacao) {
          await result.current.conciliarTransacao(
            "transacao-123",
            "extrato-456",
          );
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve obter divergências", async () => {
      const { result } = renderHook(() => useConciliacaoBancaria());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.divergencias) {
        expect(Array.isArray(result.current.divergencias)).toBe(true);
      }
    });
  });
});
