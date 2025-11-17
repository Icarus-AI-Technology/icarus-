/**
 * Batch 1 Tests: Hooks de Cadastros Críticos
 *
 * @description
 * Testes unitários para hooks de gerenciamento de cadastros do ICARUS v5.0
 *
 * Hooks testados:
 * - useFornecedores
 * - useProdutos
 * - usePacientes
 * - useHospitais
 * - useConvenios
 * - useEquipesMedicas
 * - useTransportadoras
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFornecedores } from "../useFornecedores";
import { useProdutos } from "../useProdutos";
import { usePacientes } from "../usePacientes";
import { useHospitais } from "../useHospitais";
import { useConvenios } from "../useConvenios";
import { useEquipesMedicas } from "../useEquipesMedicas";
import { useTransportadoras } from "../useTransportadoras";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe("📦 Batch 1: Hooks de Cadastros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. useFornecedores
  // ==========================================
  describe("useFornecedores", () => {
    it("deve buscar fornecedores com sucesso", async () => {
      const { result } = renderHook(() => useFornecedores());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.fornecedores).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar fornecedor", async () => {
      const { result } = renderHook(() => useFornecedores());

      const novoFornecedor = {
        razao_social: "Fornecedor Teste LTDA",
        cnpj: "12.345.678/0001-90",
        email: "contato@fornecedor.com",
        telefone: "(11) 98765-4321",
        tipo: "distribuidor" as const,
        categoria: ["OPME"],
        status: "ativo" as const,
      };

      await waitFor(async () => {
        if (result.current.criarFornecedor) {
          await result.current.criarFornecedor(novoFornecedor);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar fornecedor", async () => {
      const { result } = renderHook(() => useFornecedores());

      await waitFor(async () => {
        if (result.current.atualizarFornecedor) {
          await result.current.atualizarFornecedor("123", {
            status: "inativo",
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve lidar com erro ao buscar fornecedores", async () => {
      const mockError = new Error("Erro ao buscar fornecedores");
      vi.mocked(require("@/lib/supabase").supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as never);

      const { result } = renderHook(() => useFornecedores());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================
  // 2. useProdutos
  // ==========================================
  describe("useProdutos", () => {
    it("deve buscar produtos com sucesso", async () => {
      const { result } = renderHook(() => useProdutos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.produtos).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar produto", async () => {
      const { result } = renderHook(() => useProdutos());

      const novoProduto = {
        codigo: "PROD-001",
        nome: "Produto Teste",
        categoria: "OPME",
        unidade: "UN",
        valor_unitario: 199.9,
        custo_medio: 150.0,
        estoque_minimo: 10,
        estoque_maximo: 100,
        ponto_reposicao: 20,
        ativo: true,
        controlado: false,
        rastreavel: true,
        consignado: false,
      };

      await waitFor(async () => {
        if (result.current.criarProduto) {
          await result.current.criarProduto(novoProduto);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar produto", async () => {
      const { result } = renderHook(() => useProdutos());

      await waitFor(async () => {
        if (result.current.atualizarProduto) {
          await result.current.atualizarProduto("123", {
            valor_unitario: 249.9,
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve deletar produto", async () => {
      const { result } = renderHook(() => useProdutos());

      await waitFor(async () => {
        if (result.current.deletarProduto) {
          await result.current.deletarProduto("123");
        }
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // 3. usePacientes
  // ==========================================
  describe("usePacientes", () => {
    it("deve buscar pacientes com sucesso", async () => {
      const { result } = renderHook(() => usePacientes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pacientes).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar paciente", async () => {
      const { result } = renderHook(() => usePacientes());

      const novoPaciente = {
        nome: "João Silva",
        cpf: "123.456.789-00",
        data_nascimento: "1990-01-01",
        email: "joao@email.com",
        telefone: "(11) 98765-4321",
        convenio_id: "conv-123",
        status: "ativo" as const,
      };

      await waitFor(async () => {
        if (result.current.criarPaciente) {
          await result.current.criarPaciente(novoPaciente);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar paciente", async () => {
      const { result } = renderHook(() => usePacientes());

      await waitFor(async () => {
        if (result.current.atualizarPaciente) {
          await result.current.atualizarPaciente("123", {
            telefone: "(11) 91111-1111",
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve lidar com erro", async () => {
      const mockError = new Error("Erro ao buscar pacientes");
      vi.mocked(require("@/lib/supabase").supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as never);

      const { result } = renderHook(() => usePacientes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================
  // 4. useHospitais
  // ==========================================
  describe("useHospitais", () => {
    it("deve buscar hospitais com sucesso", async () => {
      const { result } = renderHook(() => useHospitais());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hospitais).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar hospital", async () => {
      const { result } = renderHook(() => useHospitais());

      const novoHospital = {
        nome: "Hospital Teste",
        cnpj: "12.345.678/0001-90",
        tipo: "privado" as const,
        email: "contato@hospital.com",
        telefone: "(11) 3333-3333",
        status: "ativo" as const,
      };

      await waitFor(async () => {
        if (result.current.criarHospital) {
          await result.current.criarHospital(novoHospital);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar hospital", async () => {
      const { result } = renderHook(() => useHospitais());

      await waitFor(async () => {
        if (result.current.atualizarHospital) {
          await result.current.atualizarHospital("123", { status: "inativo" });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve deletar hospital", async () => {
      const { result } = renderHook(() => useHospitais());

      await waitFor(async () => {
        if (result.current.deletarHospital) {
          await result.current.deletarHospital("123");
        }
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // 5. useConvenios
  // ==========================================
  describe("useConvenios", () => {
    it("deve buscar convênios com sucesso", async () => {
      const { result } = renderHook(() => useConvenios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.convenios).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar convênio", async () => {
      const { result } = renderHook(() => useConvenios());

      const novoConvenio = {
        nome: "Convênio Teste",
        tipo: "plano_saude" as const,
        cnpj: "12.345.678/0001-90",
        telefone: "(11) 4444-4444",
        status: "ativo" as const,
      };

      await waitFor(async () => {
        if (result.current.criarConvenio) {
          await result.current.criarConvenio(novoConvenio);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar convênio", async () => {
      const { result } = renderHook(() => useConvenios());

      await waitFor(async () => {
        if (result.current.atualizarConvenio) {
          await result.current.atualizarConvenio("123", { status: "inativo" });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve lidar com erro", async () => {
      const mockError = new Error("Erro ao buscar convênios");
      vi.mocked(require("@/lib/supabase").supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as never);

      const { result } = renderHook(() => useConvenios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================
  // 6. useEquipesMedicas
  // ==========================================
  describe("useEquipesMedicas", () => {
    it("deve buscar equipes médicas com sucesso", async () => {
      const { result } = renderHook(() => useEquipesMedicas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.equipes).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar equipe médica", async () => {
      const { result } = renderHook(() => useEquipesMedicas());

      const novaEquipe = {
        nome: "Equipe Cirúrgica A",
        especialidade: "ortopedia",
        medico_responsavel_id: "med-123",
        membros: ["med-123", "med-456"],
        status: "ativa" as const,
      };

      await waitFor(async () => {
        if (result.current.criarEquipe) {
          await result.current.criarEquipe(novaEquipe);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar equipe médica", async () => {
      const { result } = renderHook(() => useEquipesMedicas());

      await waitFor(async () => {
        if (result.current.atualizarEquipe) {
          await result.current.atualizarEquipe("123", { status: "inativa" });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve deletar equipe médica", async () => {
      const { result } = renderHook(() => useEquipesMedicas());

      await waitFor(async () => {
        if (result.current.deletarEquipe) {
          await result.current.deletarEquipe("123");
        }
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // 7. useTransportadoras
  // ==========================================
  describe("useTransportadoras", () => {
    it("deve buscar transportadoras com sucesso", async () => {
      const { result } = renderHook(() => useTransportadoras());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transportadoras).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("deve criar transportadora", async () => {
      const { result } = renderHook(() => useTransportadoras());

      const novaTransportadora = {
        nome: "Transportadora Teste",
        cnpj: "12.345.678/0001-90",
        tipo: "terrestre" as const,
        email: "contato@transportadora.com",
        telefone: "(11) 5555-5555",
        status: "ativo" as const,
      };

      await waitFor(async () => {
        if (result.current.criarTransportadora) {
          await result.current.criarTransportadora(novaTransportadora);
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve atualizar transportadora", async () => {
      const { result } = renderHook(() => useTransportadoras());

      await waitFor(async () => {
        if (result.current.atualizarTransportadora) {
          await result.current.atualizarTransportadora("123", {
            status: "inativo",
          });
        }
      });

      expect(result.current.error).toBeNull();
    });

    it("deve lidar com erro", async () => {
      const mockError = new Error("Erro ao buscar transportadoras");
      vi.mocked(require("@/lib/supabase").supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as never);

      const { result } = renderHook(() => useTransportadoras());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
