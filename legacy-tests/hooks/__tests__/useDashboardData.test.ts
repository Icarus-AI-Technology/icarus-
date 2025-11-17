import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../useDashboardData";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: [],
            error: null,
          }),
        ),
      })),
    })),
  },
}));

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("should fetch dashboard data successfully", async () => {
    const mockDashboardData = {
      totalVendas: 100000,
      totalPedidos: 50,
      ticketMedio: 2000,
      crescimento: 15.5,
      vendasMes: [
        { mes: "Jan", valor: 10000 },
        { mes: "Fev", valor: 12000 },
      ],
    };

    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockDashboardData,
      error: null,
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockDashboardData);
      expect(result.current.data?.totalVendas).toBe(100000);
    });
  });

  it("should handle fetch error", async () => {
    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: null,
      error: { message: "RPC error" },
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it("should refetch data on demand", async () => {
    const { supabase } = await import("@/lib/supabase");
    const rpcMock = supabase.rpc as ReturnType<typeof vi.fn>;

    rpcMock.mockResolvedValue({
      data: { totalVendas: 50000 },
      error: null,
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(async () => {
      if (result.current.refetch) {
        await result.current.refetch();
        expect(rpcMock).toHaveBeenCalledTimes(2); // Initial + refetch
      }
    });
  });
});
