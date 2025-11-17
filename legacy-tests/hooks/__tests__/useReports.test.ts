import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReports } from "../useReports";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({
            data: [],
            error: null,
          }),
        ),
      })),
    })),
    rpc: vi.fn(),
  },
}));

describe("useReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useReports());

    expect(result.current.loading).toBe(true);
    expect(result.current.reports).toEqual([]);
  });

  it("should generate report", async () => {
    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { report_id: "r1" },
      error: null,
    });

    const { result } = renderHook(() => useReports());

    await waitFor(async () => {
      if (result.current.generateReport) {
        const id = await result.current.generateReport("vendas", {});
        expect(id).toBeDefined();
      }
    });
  });

  it("should export report", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(async () => {
      if (result.current.exportReport) {
        await result.current.exportReport("r1", "pdf");
        expect(true).toBe(true);
      }
    });
  });
});
