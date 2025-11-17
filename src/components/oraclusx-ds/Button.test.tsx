import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/oraclusx-ds";

describe("Button (OraclusX DS)", () => {
  it("deve renderizar com texto", () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText("Clique aqui")).toBeInTheDocument();
  });

  it("deve chamar onClick quando clicado", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);

    const button = screen.getByText("Clique");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("deve estar desabilitado quando disabled=true", () => {
    render(<Button disabled>Desabilitado</Button>);

    const button = screen.getByText("Desabilitado");
    expect(button).toBeDisabled();
  });

  it("deve renderizar variantes corretamente", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger")).toBeInTheDocument();
  });

  it("deve renderizar loading state", () => {
    render(<Button loading>Carregando...</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("deve aceitar className customizada", () => {
    render(<Button className="custom-btn">Custom</Button>);

    const button = screen.getByText("Custom");
    expect(button).toHaveClass("custom-btn");
  });
});
