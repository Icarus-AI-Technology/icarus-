import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePedidos } from "@/hooks/usePedidos";

// Mock do Supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({
            data: mockPedidos,
            error: null,
          }),
        ),
      })),
      insert: vi.fn(() =>
        Promise.resolve({ data: mockPedidos[0], error: null }),
      ),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockPedidos[0], error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

const mockPedidos = [
  {
    id: "1",
    numero_pedido: "PED-001",
    fornecedor_id: "f1",
    data_pedido: "2025-10-27",
    status: "pendente",
    valor_total: 10000,
    itens: [],
  },
];

describe("usePedidos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar com estado vazio", () => {
    const { result } = renderHook(() => usePedidos());

    expect(result.current.pedidos).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar pedidos com sucesso", async () => {
    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pedidos).toHaveLength(1);
    expect(result.current.pedidos[0].numero_pedido).toBe("PED-001");
  });

  it("deve criar um novo pedido", async () => {
    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newPedido = {
      fornecedor_id: "f2",
      data_pedido: "2025-10-28",
      status: "pendente",
      valor_total: 5000,
      itens: [],
    };

    await result.current.createPedido(newPedido);
    expect(result.current.error).toBeNull();
  });

  it("deve atualizar status de um pedido", async () => {
    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updatePedidoStatus("1", "aprovado");
    expect(result.current.error).toBeNull();
  });
});
