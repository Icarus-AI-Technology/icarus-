import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/oraclusx-ds";

describe("Card (OraclusX DS)", () => {
  it("deve renderizar com título", () => {
    render(
      <Card title="Teste Card">
        <p>Conteúdo do card</p>
      </Card>,
    );

    expect(screen.getByText("Teste Card")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
  });

  it("deve renderizar children corretamente", () => {
    render(
      <Card>
        <div data-testid="card-content">Teste</div>
      </Card>,
    );

    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    const { container } = render(
      <Card className="custom-class">Conteúdo</Card>,
    );

    const card = container.firstChild;
    expect(card).toHaveClass("custom-class");
  });

  it("deve renderizar sem título", () => {
    render(
      <Card>
        <p>Apenas conteúdo</p>
      </Card>,
    );

    expect(screen.getByText("Apenas conteúdo")).toBeInTheDocument();
  });
});
