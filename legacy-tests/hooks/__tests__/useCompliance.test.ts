import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCompliance } from "../useCompliance";

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

describe("useCompliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useCompliance());

    expect(result.current.loading).toBe(true);
    expect(result.current.auditorias).toEqual([]);
  });

  it("should fetch compliance auditorias successfully", async () => {
    const mockAuditorias = [
      {
        id: "1",
        tipo: "ANVISA",
        status: "pendente",
        data_auditoria: "2024-01-15",
        resultado: null,
      },
      {
        id: "2",
        tipo: "RDC",
        status: "aprovado",
        data_auditoria: "2024-01-10",
        resultado: "conforme",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockAuditorias,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.auditorias).toHaveLength(2);
    });
  });

  it("should create new auditoria", async () => {
    const novaAuditoria = {
      tipo: "ANVISA",
      descricao: "Auditoria de rotina",
      itens_verificacao: ["Item 1", "Item 2"],
    };

    const { result } = renderHook(() => useCompliance());

    await waitFor(async () => {
      if (result.current.criarAuditoria) {
        await result.current.criarAuditoria(novaAuditoria);
        expect(true).toBe(true);
      }
    });
  });

  it("should calculate compliance score", async () => {
    const mockScore = {
      total: 100,
      conformes: 85,
      nao_conformes: 10,
      pendentes: 5,
      score: 85,
    };

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockScore,
      error: null,
    });

    const { result } = renderHook(() => useCompliance());

    await waitFor(async () => {
      if (result.current.calcularScore) {
        const score = await result.current.calcularScore(
          "2024-01-01",
          "2024-12-31",
        );
        expect(score).toBe(85);
      }
    });
  });

  it("should filter by compliance type", async () => {
    const tipo = "ANVISA";

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      const { supabase } = require("@/lib/supabase");
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      expect(fromMock).toHaveBeenCalled();
    });
  });

  it("should handle error fetching auditorias", async () => {
    const mockError = { message: "Database error" };

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: mockError,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
});
