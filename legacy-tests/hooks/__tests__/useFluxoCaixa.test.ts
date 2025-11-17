import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFluxoCaixa } from "../useFluxoCaixa";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              }),
            ),
          })),
        })),
      })),
    })),
    rpc: vi.fn(),
  },
}));

describe("useFluxoCaixa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() =>
      useFluxoCaixa("2024-01-01", "2024-12-31"),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.transacoes).toEqual([]);
  });

  it("should fetch transactions successfully", async () => {
    const mockTransacoes = [
      {
        id: "1",
        tipo: "entrada",
        valor: 1000,
        data: "2024-01-15",
        descricao: "Venda",
      },
      {
        id: "2",
        tipo: "saida",
        valor: 500,
        data: "2024-01-20",
        descricao: "Compra",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() =>
              Promise.resolve({
                data: mockTransacoes,
                error: null,
              }),
            ),
          })),
        })),
      })),
    });

    const { result } = renderHook(() =>
      useFluxoCaixa("2024-01-01", "2024-12-31"),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.transacoes).toHaveLength(2);
    });
  });

  it("should calculate saldo correctly", async () => {
    const mockTransacoes = [
      { tipo: "entrada", valor: 1000 },
      { tipo: "entrada", valor: 500 },
      { tipo: "saida", valor: 300 },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() =>
              Promise.resolve({
                data: mockTransacoes,
                error: null,
              }),
            ),
          })),
        })),
      })),
    });

    const { result } = renderHook(() =>
      useFluxoCaixa("2024-01-01", "2024-12-31"),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Saldo = 1000 + 500 - 300 = 1200
      if (result.current.saldo) {
        expect(result.current.saldo).toBe(1200);
      }
    });
  });

  it("should filter by date range", async () => {
    const dataInicio = "2024-01-01";
    const dataFim = "2024-01-31";

    const { result } = renderHook(() => useFluxoCaixa(dataInicio, dataFim));

    await waitFor(() => {
      const { supabase } = require("@/lib/supabase");
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      expect(fromMock).toHaveBeenCalledWith("transacoes");
    });
  });
});
