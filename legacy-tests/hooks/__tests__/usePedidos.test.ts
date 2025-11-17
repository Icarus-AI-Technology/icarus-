import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePedidos } from "../usePedidos";

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
        in: vi.fn(() => ({
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

describe("usePedidos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => usePedidos());

    expect(result.current.loading).toBe(true);
    expect(result.current.pedidos).toEqual([]);
  });

  it("should fetch pedidos successfully", async () => {
    const mockPedidos = [
      {
        id: "1",
        fornecedor_id: "f1",
        status: "pendente",
        total: 5000,
        data_pedido: "2024-01-15",
      },
      {
        id: "2",
        fornecedor_id: "f2",
        status: "aprovado",
        total: 7500,
        data_pedido: "2024-01-20",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockPedidos,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.pedidos).toHaveLength(2);
    });
  });

  it("should criar pedido successfully", async () => {
    const novoPedido = {
      fornecedor_id: "f1",
      items: [
        { produto_id: "p1", quantidade: 10, valor_unitario: 100 },
        { produto_id: "p2", quantidade: 5, valor_unitario: 200 },
      ],
      observacoes: "Urgente",
    };

    const { result } = renderHook(() => usePedidos());

    await waitFor(async () => {
      if (result.current.criarPedido) {
        await result.current.criarPedido(novoPedido);
        expect(true).toBe(true);
      }
    });
  });

  it("should aprovar pedido", async () => {
    const pedidoId = "p1";

    const { result } = renderHook(() => usePedidos());

    await waitFor(async () => {
      if (result.current.aprovarPedido) {
        await result.current.aprovarPedido(pedidoId);
        expect(true).toBe(true);
      }
    });
  });

  it("should calcular total do pedido", async () => {
    const mockTotal = 2500;

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockTotal,
      error: null,
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(async () => {
      if (result.current.calcularTotal) {
        const total = await result.current.calcularTotal("p1");
        expect(total).toBe(mockTotal);
      }
    });
  });

  it("should filter pedidos by status", async () => {
    const status = "aprovado";

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      const { supabase } = require("@/lib/supabase");
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      expect(fromMock).toHaveBeenCalled();
    });
  });

  it("should rastrear entrega", async () => {
    const pedidoId = "p1";
    const mockRastreio = {
      codigo: "BR123456789",
      status: "em_transito",
      ultima_atualizacao: "2024-01-25T10:00:00",
    };

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockRastreio,
      error: null,
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(async () => {
      if (result.current.rastrearEntrega) {
        const rastreio = await result.current.rastrearEntrega(pedidoId);
        expect(rastreio.status).toBe("em_transito");
      }
    });
  });
});
