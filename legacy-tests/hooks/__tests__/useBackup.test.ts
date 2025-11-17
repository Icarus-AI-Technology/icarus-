import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBackup } from "../useBackup";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe("useBackup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useBackup());

    expect(result.current.loading).toBe(false);
  });

  it("should create backup", async () => {
    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { backup_id: "b1" },
      error: null,
    });

    const { result } = renderHook(() => useBackup());

    await waitFor(async () => {
      if (result.current.createBackup) {
        const id = await result.current.createBackup("manual");
        expect(id).toBeDefined();
      }
    });
  });

  it("should restore backup", async () => {
    const { supabase } = await import("@/lib/supabase");
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const { result } = renderHook(() => useBackup());

    await waitFor(async () => {
      if (result.current.restoreBackup) {
        const success = await result.current.restoreBackup("b1");
        expect(success).toBe(true);
      }
    });
  });
});
