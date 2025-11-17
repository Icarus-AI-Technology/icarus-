import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardPrincipal from "@/pages/DashboardPrincipal";

// Mocks
vi.mock("@/hooks/useDocumentTitle", () => ({
  useDocumentTitle: vi.fn(),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.resolve({
          data: mockDashboardData,
          error: null,
        }),
      ),
    })),
    rpc: vi.fn(() =>
      Promise.resolve({
        data: mockKPIs,
        error: null,
      }),
    ),
  },
}));

const mockDashboardData = {
  cirurgias_mes: 45,
  faturamento_mes: 1250000,
  estoque_valor: 850000,
  leads_ativos: 32,
};

const mockKPIs = [
  { nome: "Cirurgias", valor: 45, variacao: 12 },
  { nome: "Faturamento", valor: 1250000, variacao: 8 },
  { nome: "Estoque", valor: 850000, variacao: -3 },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("DashboardPrincipal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título do dashboard", async () => {
    renderWithRouter(<DashboardPrincipal />);

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it("deve exibir KPIs principais", async () => {
    renderWithRouter(<DashboardPrincipal />);

    await waitFor(() => {
      expect(screen.getByText(/cirurgias/i)).toBeInTheDocument();
      expect(screen.getByText(/faturamento/i)).toBeInTheDocument();
    });
  });

  it("deve carregar dados assincronamente", async () => {
    renderWithRouter(<DashboardPrincipal />);

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });
  });
});
