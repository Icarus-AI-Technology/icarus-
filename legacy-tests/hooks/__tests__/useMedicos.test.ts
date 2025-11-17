/**
 * Testes Unitários: useMedicos
 * Cobertura: CRUD operations
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMedicos } from "../useMedicos";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn((callback) =>
            callback({ data: mockMedicos, error: null }),
          ),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: mockMedico, error: null }),
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: mockMedico, error: null }),
            ),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

const mockMedicos = [
  {
    id: "1",
    nome: "Dr. João Silva",
    crm: "12345",
    uf_crm: "SP",
    especialidade: "Ortopedia",
    status: "ativo",
  },
];

const mockMedico = mockMedicos[0];

describe("useMedicos Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar médicos no mount", async () => {
    const { result } = renderHook(() => useMedicos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.medicos).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("deve criar um novo médico", async () => {
    const { result } = renderHook(() => useMedicos());

    await act(async () => {
      await result.current.createMedico({
        nome: "Dr. Maria Santos",
        crm: "54321",
        uf_crm: "RJ",
        especialidade: "Cardiologia",
      });
    });

    expect(result.current.error).toBeNull();
  });

  it("deve atualizar um médico existente", async () => {
    const { result } = renderHook(() => useMedicos());

    await act(async () => {
      await result.current.updateMedico("1", {
        nome: "Dr. João Silva Atualizado",
      });
    });

    expect(result.current.error).toBeNull();
  });

  it("deve deletar um médico", async () => {
    const { result } = renderHook(() => useMedicos());

    await act(async () => {
      await result.current.deleteMedico("1");
    });

    expect(result.current.error).toBeNull();
  });
});
