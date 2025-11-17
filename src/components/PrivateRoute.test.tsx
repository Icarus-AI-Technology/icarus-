import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PrivateRoute } from "@/components/PrivateRoute";

// Mock do contexto de autenticação
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const TestComponent = () => <div>Conteúdo Protegido</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PrivateRoute", () => {
  it("deve renderizar children quando usuário está autenticado", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "test@example.com" },
      loading: false,
    });

    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument();
  });

  it("deve mostrar loading quando autenticação está carregando", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
  });

  it("deve redirecionar para login quando usuário não está autenticado", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
  });
});
