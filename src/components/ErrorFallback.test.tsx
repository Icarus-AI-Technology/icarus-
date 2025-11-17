import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorFallback } from "@/components/ErrorFallback";

describe("ErrorFallback", () => {
  it("deve renderizar mensagem de erro", () => {
    const error = new Error("Erro de teste");

    render(<ErrorFallback error={error} />);

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
  });

  it("deve exibir detalhes do erro em desenvolvimento", () => {
    const error = new Error("Erro específico");

    render(<ErrorFallback error={error} />);

    // Verifica se há algum texto relacionado ao erro
    const errorElements = screen.getAllByText(/erro/i);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it("deve renderizar sem crashar quando não há erro", () => {
    render(<ErrorFallback error={null as any} />);
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
  });
});
