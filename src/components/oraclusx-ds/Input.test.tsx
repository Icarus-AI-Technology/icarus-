import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Input } from "@/components/oraclusx-ds";

describe("Input (OraclusX DS)", () => {
  it("deve renderizar com label", () => {
    render(<Input label="Nome" />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
  });

  it("deve aceitar valor e onChange", async () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "teste" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("deve renderizar placeholder", () => {
    render(<Input placeholder="Digite aqui..." />);
    expect(screen.getByPlaceholderText("Digite aqui...")).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro", () => {
    render(<Input error="Campo obrigatório" />);
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("deve estar desabilitado quando disabled=true", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("deve aceitar tipos diferentes", () => {
    const { rerender } = render(<Input type="text" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "text");

    rerender(<Input type="email" />);
    input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    // Password inputs não têm role textbox
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });

  it("deve renderizar com ícone", () => {
    const Icon = () => <span data-testid="custom-icon">🔍</span>;
    render(<Input icon={<Icon />} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
