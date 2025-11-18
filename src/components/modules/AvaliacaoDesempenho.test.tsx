import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvaliacaoDesempenho } from "@/components/modules/AvaliacaoDesempenho";

describe("AvaliacaoDesempenho", () => {
  it("deve estar definido", () => {
    render(<AvaliacaoDesempenho />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
