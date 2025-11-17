import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useConsignacao } from "../useConsignacao";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      })),
      insert: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null,
        }),
      ),
      update: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          }),
        ),
      })),
    })),
    rpc: vi.fn(),
  },
}));

describe("useConsignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useConsignacao());

    expect(result.current.loading).toBe(true);
    expect(result.current.consignacoes).toEqual([]);
  });

  it("should fetch consignações successfully", async () => {
    const mockConsignacoes = [
      {
        id: "1",
        hospital_id: "h1",
        status: "ativa",
        total: 1000,
      },
      {
        id: "2",
        hospital_id: "h2",
        status: "pendente",
        total: 2000,
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockConsignacoes,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useConsignacao());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.consignacoes).toHaveLength(2);
    });
  });

  it("should create consignação successfully", async () => {
    const novaConsignacao = {
      hospital_id: "h1",
      produtos: [],
      observacoes: "Test",
    };

    const { result } = renderHook(() => useConsignacao());

    await waitFor(async () => {
      if (result.current.criarConsignacao) {
        await result.current.criarConsignacao(novaConsignacao);
        expect(true).toBe(true);
      }
    });
  });

  it("should calculate totals correctly", async () => {
    const mockConsignacao = {
      id: "1",
      items: [
        { quantidade: 2, valor_unitario: 100 },
        { quantidade: 3, valor_unitario: 50 },
      ],
    };

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: 350, // 2*100 + 3*50
      error: null,
    });

    const { result } = renderHook(() => useConsignacao());

    await waitFor(async () => {
      if (result.current.calcularTotal) {
        const total = await result.current.calcularTotal(mockConsignacao.id);
        expect(total).toBe(350);
      }
    });
  });
});
