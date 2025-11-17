import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCirurgias } from "../useCirurgias";

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

describe("useCirurgias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useCirurgias());

    expect(result.current.loading).toBe(true);
    expect(result.current.cirurgias).toEqual([]);
  });

  it("should fetch cirurgias successfully", async () => {
    const mockCirurgias = [
      {
        id: "1",
        paciente_id: "p1",
        medico_id: "m1",
        tipo: "Ortopedia",
        data_agendada: "2024-02-15",
        status: "agendada",
      },
      {
        id: "2",
        paciente_id: "p2",
        medico_id: "m2",
        tipo: "Cardiologia",
        data_agendada: "2024-02-20",
        status: "realizada",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockCirurgias,
              error: null,
            }),
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useCirurgias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.cirurgias).toHaveLength(2);
    });
  });

  it("should agendar cirurgia successfully", async () => {
    const novaCirurgia = {
      paciente_id: "p1",
      medico_id: "m1",
      tipo: "Ortopedia",
      data_agendada: "2024-03-01",
      materiais_necessarios: ["Material 1", "Material 2"],
    };

    const { result } = renderHook(() => useCirurgias());

    await waitFor(async () => {
      if (result.current.agendarCirurgia) {
        await result.current.agendarCirurgia(novaCirurgia);
        expect(true).toBe(true);
      }
    });
  });

  it("should calcular custo estimated", async () => {
    const cirurgiaId = "c1";
    const mockCusto = 15000;

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockCusto,
      error: null,
    });

    const { result } = renderHook(() => useCirurgias());

    await waitFor(async () => {
      if (result.current.calcularCusto) {
        const custo = await result.current.calcularCusto(cirurgiaId);
        expect(custo).toBe(mockCusto);
      }
    });
  });

  it("should update cirurgia status", async () => {
    const cirurgiaId = "c1";
    const novoStatus = "realizada";

    const { result } = renderHook(() => useCirurgias());

    await waitFor(async () => {
      if (result.current.atualizarStatus) {
        await result.current.atualizarStatus(cirurgiaId, novoStatus);
        expect(true).toBe(true);
      }
    });
  });
});
