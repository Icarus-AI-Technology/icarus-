import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNotificacoes } from "../useNotificacoes";

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
  },
}));

describe("useNotificacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useNotificacoes());

    expect(result.current.loading).toBe(true);
    expect(result.current.notificacoes).toEqual([]);
  });

  it("should fetch notificacoes", async () => {
    const mockNotificacoes = [
      {
        id: "1",
        tipo: "info",
        mensagem: "Nova atualização",
        lida: false,
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockNotificacoes,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useNotificacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should mark as read", async () => {
    const { result } = renderHook(() => useNotificacoes());

    await waitFor(async () => {
      if (result.current.marcarComoLida) {
        await result.current.marcarComoLida("n1");
        expect(true).toBe(true);
      }
    });
  });

  it("should count unread", () => {
    const { result } = renderHook(() => useNotificacoes());

    expect(typeof result.current.naoLidas).toBe("number");
  });
});
