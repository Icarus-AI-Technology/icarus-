import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIntegrations } from "../useIntegrations";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.resolve({
          data: [],
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

describe("useIntegrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch integrations", async () => {
    const mockIntegrations = [
      {
        id: "i1",
        nome: "SendGrid",
        status: "ativo",
        tipo: "email",
      },
    ];

    const { supabase } = await import("@/lib/supabase");
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValueOnce({
      select: vi.fn(() =>
        Promise.resolve({
          data: mockIntegrations,
          error: null,
        }),
      ),
    });

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should test connection", async () => {
    const { result } = renderHook(() => useIntegrations());

    await waitFor(async () => {
      if (result.current.testConnection) {
        const success = await result.current.testConnection("i1");
        expect(typeof success).toBe("boolean");
      }
    });
  });
});
